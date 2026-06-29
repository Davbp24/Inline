import type { AgentContext } from './types'
import { runAgentGraph, type OrchestrationResult } from '@/lib/ai/graph'

/**
 * Coordinator entry point for the agent layer.
 *
 * Orchestration now runs on a compiled LangGraph StateGraph (route -> agent ->
 * evaluate, with a human-in-the-loop interrupt on state-changing actions). This
 * function preserves the original contract — give it an AgentContext, get back a
 * uniform OrchestrationResult — so existing callers (the internship automation,
 * eval/verify scripts) are unaffected. Callers that need the checkpointer thread
 * id or a pending approval interrupt should use `runAgentGraph` directly.
 */
export type { OrchestrationResult }

export async function runAgentPipeline(ctx: AgentContext): Promise<OrchestrationResult> {
  return runAgentGraph(ctx)
}
