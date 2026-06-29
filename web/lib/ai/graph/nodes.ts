import { interrupt, type LangGraphRunnableConfig } from '@langchain/langgraph'
import { routeIntent } from '@/lib/ai/agents/routerAgent'
import { evaluateResult } from '@/lib/ai/agents/evaluatorAgent'
import { researchAgent } from '@/lib/ai/agents/researchAgent'
import { memoryAgent } from '@/lib/ai/agents/memoryAgent'
import { rewriteAgent } from '@/lib/ai/agents/rewriteAgent'
import { actionAgent } from '@/lib/ai/agents/actionAgent'
import { fitAgent } from '@/lib/ai/agents/fitAgent'
import type { Agent, AgentContext, AgentIntent } from '@/lib/ai/agents/types'
import type { AgentState, GraphConfigurable } from './state'

/**
 * Graph nodes. Each is a thin wrapper around the existing agent layer: it
 * rebuilds an `AgentContext` from graph state + the runtime Supabase client and
 * delegates to the same router/agents/evaluator used before LangGraph. No agent
 * logic is reimplemented here.
 */

/** Intent -> specialized agent (unchanged from the previous orchestrator). */
export const REGISTRY: Record<AgentIntent, Agent> = {
  rewrite: rewriteAgent,
  summarize: researchAgent,
  research: researchAgent,
  ask_context: memoryAgent,
  save_memory: actionAgent,
  career_fit: fitAgent,
  action: actionAgent,
}

/** Intents whose output benefits from an LLM groundedness check. */
export const JUDGE_INTENTS = new Set<AgentIntent>([
  'ask_context',
  'research',
  'summarize',
  'career_fit',
])

/** Intents that change user state and therefore require approval. */
export const STATE_CHANGING_INTENTS = new Set<AgentIntent>(['save_memory', 'action'])

function configurable(config: LangGraphRunnableConfig): GraphConfigurable {
  const c = config.configurable as Partial<GraphConfigurable> | undefined
  if (!c?.supabase) {
    throw new Error('Graph configurable.supabase is required (pass it via config.configurable).')
  }
  return c as GraphConfigurable
}

/** Rebuild the shared AgentContext that every existing agent expects. */
function toContext(state: AgentState, config: LangGraphRunnableConfig): AgentContext {
  return {
    userPrompt: state.userPrompt,
    selectedText: state.selectedText,
    pageUrl: state.pageUrl,
    pageTitle: state.pageTitle,
    pageContent: state.pageContent,
    workspaceId: state.workspaceId,
    userId: state.userId,
    supabase: configurable(config).supabase,
    intent: state.intent,
    confirm: state.confirm,
    params: state.params,
  }
}

function resolveActionName(state: AgentState): string {
  const raw = String(state.params?.action ?? '').trim()
  if (raw === 'save_note' || raw === 'export_notion') return raw
  return 'save_note'
}

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

/** Router node: classify the request into one intent. */
export async function routerNode(
  state: AgentState,
  config: LangGraphRunnableConfig,
): Promise<Partial<AgentState>> {
  const route = await routeIntent(toContext(state, config))
  return {
    intent: route.intent,
    routedBy: route.source,
    usage: route.usage ? [route.usage] : [],
  }
}

/** Agent node: run the specialized agent for read-only intents. */
export async function agentNode(
  state: AgentState,
  config: LangGraphRunnableConfig,
): Promise<Partial<AgentState>> {
  const intent = state.intent ?? 'ask_context'
  const agent = REGISTRY[intent]
  const result = await agent.run({ ...toContext(state, config), intent })
  return {
    agentName: result.agent,
    text: result.text,
    sources: result.sources ?? [],
    actions: result.actions ?? [],
    data: result.data ?? {},
    usage: result.usage ?? [],
  }
}

/**
 * Approval node (human-in-the-loop). State-changing intents pause here unless
 * the caller already passed `confirm: true` (the legacy one-shot path). When it
 * pauses, LangGraph throws a GraphInterrupt; the run resumes when invoked again
 * with `new Command({ resume })`, at which point `interrupt()` returns that value.
 */
export async function approvalNode(state: AgentState): Promise<Partial<AgentState>> {
  if (state.confirm) return { approved: true }

  const decision = interrupt<{ type: string; action: string; summary: string }, boolean | { approved?: boolean }>({
    type: 'action_approval',
    action: resolveActionName(state),
    summary: `Approve this state-changing action (${resolveActionName(state)})?`,
  })

  const approved =
    decision === true || (typeof decision === 'object' && decision?.approved === true)

  if (approved) return { approved: true }

  const action = resolveActionName(state)
  return {
    approved: false,
    text: 'Action was not approved, so nothing was changed.',
    actions: [{ type: action, status: 'needs_confirmation' }],
  }
}

/** Action node: perform the approved state change via the existing action agent. */
export async function actionNode(
  state: AgentState,
  config: LangGraphRunnableConfig,
): Promise<Partial<AgentState>> {
  const intent = state.intent ?? 'action'
  const result = await actionAgent.run({ ...toContext(state, config), intent, confirm: true })
  return {
    agentName: result.agent,
    text: result.text,
    actions: result.actions ?? [],
    data: result.data ?? {},
    usage: result.usage ?? [],
  }
}

/** Evaluator node: deterministic guardrails + optional LLM groundedness judge. */
export async function evaluatorNode(
  state: AgentState,
  config: LangGraphRunnableConfig,
): Promise<Partial<AgentState>> {
  const evaluation = await evaluateResult(
    toContext(state, config),
    {
      agent: state.agentName ?? state.intent ?? 'agent',
      text: state.text,
      sources: state.sources,
      actions: state.actions,
      data: state.data,
    },
    { judge: state.intent ? JUDGE_INTENTS.has(state.intent) : false },
  )
  return {
    evaluation: { pass: evaluation.pass, notes: evaluation.notes },
    usage: evaluation.usage,
  }
}

// ---------------------------------------------------------------------------
// Conditional edge routers
// ---------------------------------------------------------------------------

/** After routing: state-changing intents need approval; everything else answers. */
export function routeAfterRouter(state: AgentState): 'agent' | 'approval' {
  return state.intent && STATE_CHANGING_INTENTS.has(state.intent) ? 'approval' : 'agent'
}

/** After approval: run the action when approved, otherwise skip to evaluation. */
export function routeAfterApproval(state: AgentState): 'action' | 'evaluator' {
  return state.approved ? 'action' : 'evaluator'
}
