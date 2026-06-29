import { randomUUID } from 'node:crypto'
import {
  StateGraph,
  MemorySaver,
  Command,
  START,
  END,
  INTERRUPT,
  isInterrupted,
} from '@langchain/langgraph'
import type { RagSource } from '@/lib/ai/rag/retrieval'
import type {
  AgentAction,
  AgentContext,
  AgentIntent,
  AgentUsage,
} from '@/lib/ai/agents/types'
import { AgentStateAnnotation } from './state'
import {
  routerNode,
  agentNode,
  approvalNode,
  actionNode,
  evaluatorNode,
  routeAfterRouter,
  routeAfterApproval,
} from './nodes'

/**
 * LangGraph orchestration for the Inline agent workflow.
 *
 * The graph encodes the same flow the custom orchestrator used to run by hand
 * (route -> agent -> evaluate) as a compiled StateGraph with conditional edges
 * and a human-in-the-loop interrupt on the state-changing branch. Models are
 * still called through the Vercel AI SDK inside each node, so the provider
 * fallback and usage logging are unchanged.
 *
 *   START -> router --(read-only)--> agent --------------------> evaluator -> END
 *                  \--(save/action)-> approval --(approved)--> action -> evaluator
 *                                              \--(rejected)--> evaluator
 */

/** Stable result shape consumed by the API route, persistence, and automations. */
export type OrchestrationResult = {
  intent: AgentIntent
  routedBy: 'explicit' | 'model' | 'keyword' | 'default'
  agentsUsed: string[]
  text: string
  sources: RagSource[]
  actions: AgentAction[]
  data: Record<string, unknown>
  usage: AgentUsage[]
  evaluation: { pass: boolean; notes: string }
}

/** runAgentGraph adds the checkpointer thread id and any pending HITL interrupt. */
export type GraphRunResult = OrchestrationResult & {
  threadId: string
  interrupt?: { action?: string; summary?: string }
}

// A single in-memory checkpointer + compiled graph per server process. Threads
// persist across requests for the process lifetime; a durable Postgres/Supabase
// checkpointer (so interrupts survive restarts and multiple instances) is the
// documented follow-up.
const checkpointer = new MemorySaver()

const agentGraph = new StateGraph(AgentStateAnnotation)
  .addNode('router', routerNode)
  .addNode('agent', agentNode)
  .addNode('approval', approvalNode)
  .addNode('action', actionNode)
  .addNode('evaluator', evaluatorNode)
  .addEdge(START, 'router')
  .addConditionalEdges('router', routeAfterRouter, { agent: 'agent', approval: 'approval' })
  .addEdge('agent', 'evaluator')
  .addConditionalEdges('approval', routeAfterApproval, { action: 'action', evaluator: 'evaluator' })
  .addEdge('action', 'evaluator')
  .addEdge('evaluator', END)
  .compile({ checkpointer })

export type RunAgentGraphOptions = {
  /** Existing thread to resume; a new one is generated for fresh runs. */
  threadId?: string
  /** When set, resume an interrupted run with this value (approval decision). */
  resume?: unknown
}

/**
 * Run (or resume) the agent graph for one request. Returns the uniform
 * OrchestrationResult plus the thread id and, when the run paused for approval,
 * an `interrupt` descriptor the caller can surface to the user.
 */
export async function runAgentGraph(
  ctx: AgentContext,
  opts: RunAgentGraphOptions = {},
): Promise<GraphRunResult> {
  const threadId = opts.threadId ?? randomUUID()
  const config = {
    configurable: { thread_id: threadId, supabase: ctx.supabase },
  }

  type GraphInvokeInput = Parameters<typeof agentGraph.invoke>[0]
  const freshInput = {
    userPrompt: ctx.userPrompt,
    selectedText: ctx.selectedText,
    pageUrl: ctx.pageUrl,
    pageTitle: ctx.pageTitle,
    pageContent: ctx.pageContent,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    confirm: ctx.confirm,
    params: ctx.params,
    intent: ctx.intent,
  }
  // A Command (resume) is handled specially by invoke at runtime; the cast just
  // reconciles its default node-name generic with the compiled graph's nodes.
  const input: GraphInvokeInput =
    opts.resume !== undefined
      ? (new Command({ resume: opts.resume }) as unknown as GraphInvokeInput)
      : freshInput

  const result = await agentGraph.invoke(input, config)

  const intent = (result.intent ?? ctx.intent ?? 'ask_context') as AgentIntent
  const routedBy = (result.routedBy ??
    (ctx.intent ? 'explicit' : 'default')) as OrchestrationResult['routedBy']
  const usage: AgentUsage[] = result.usage ?? []
  const agentsUsed = Array.from(
    new Set<string>([
      intent,
      ...(result.agentName ? [result.agentName] : []),
      ...usage.map((u) => u.agent),
    ]),
  )

  const base: OrchestrationResult = {
    intent,
    routedBy,
    agentsUsed,
    text: result.text ?? '',
    sources: result.sources ?? [],
    actions: result.actions ?? [],
    data: result.data ?? {},
    usage,
    evaluation: result.evaluation ?? { pass: true, notes: 'ok' },
  }

  if (isInterrupted(result)) {
    const payload = result[INTERRUPT]?.[0]?.value as
      | { action?: string; summary?: string }
      | undefined
    return {
      ...base,
      text: base.text || payload?.summary || 'Confirmation required to proceed.',
      actions: base.actions.length
        ? base.actions
        : [{ type: payload?.action ?? 'action', status: 'needs_confirmation' }],
      threadId,
      interrupt: { action: payload?.action, summary: payload?.summary },
    }
  }

  return { ...base, threadId }
}
