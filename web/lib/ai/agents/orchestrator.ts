import type { RagSource } from '@/lib/ai/rag/retrieval'
import { routeIntent } from './routerAgent'
import { evaluateResult } from './evaluatorAgent'
import { researchAgent } from './researchAgent'
import { memoryAgent } from './memoryAgent'
import { rewriteAgent } from './rewriteAgent'
import { actionAgent } from './actionAgent'
import { fitAgent } from './fitAgent'
import type {
  Agent,
  AgentAction,
  AgentContext,
  AgentIntent,
  AgentUsage,
} from './types'

/**
 * Orchestrator — the coordinator that the /api/ai/route endpoint calls.
 * Routes the request to one specialized agent, runs an evaluator pass, and
 * aggregates the usage + agent list so the run can be persisted and surfaced.
 */

const REGISTRY: Record<AgentIntent, Agent> = {
  rewrite: rewriteAgent,
  summarize: researchAgent,
  research: researchAgent,
  ask_context: memoryAgent,
  save_memory: actionAgent,
  career_fit: fitAgent,
  action: actionAgent,
}

/** Intents whose output benefits from an LLM groundedness check. */
const JUDGE_INTENTS = new Set<AgentIntent>(['ask_context', 'research', 'summarize', 'career_fit'])

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

export async function runAgentPipeline(ctx: AgentContext): Promise<OrchestrationResult> {
  const usage: AgentUsage[] = []

  // 1. Route
  const route = await routeIntent(ctx)
  if (route.usage) usage.push(route.usage)

  // 2. Run the selected agent
  const agent = REGISTRY[route.intent]
  const scopedCtx: AgentContext = { ...ctx, intent: route.intent }
  const result = await agent.run(scopedCtx)
  if (result.usage) usage.push(...result.usage)

  // 3. Evaluate
  const evaluation = await evaluateResult(scopedCtx, result, {
    judge: JUDGE_INTENTS.has(route.intent),
  })
  usage.push(...evaluation.usage)

  const agentsUsed = Array.from(
    new Set<string>([route.intent, result.agent, ...usage.map((u) => u.agent)]),
  )

  return {
    intent: route.intent,
    routedBy: route.source,
    agentsUsed,
    text: result.text,
    sources: result.sources ?? [],
    actions: result.actions ?? [],
    data: result.data ?? {},
    usage,
    evaluation: { pass: evaluation.pass, notes: evaluation.notes },
  }
}
