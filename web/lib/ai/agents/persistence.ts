import { estimateCostUsd } from '@/lib/ai/providers/pricing'
import type { OrchestrationResult } from './orchestrator'
import type { AnyClient } from './types'

/**
 * Persist an agent run + its per-call usage events. Best-effort: if the tables
 * don't exist yet (migration not applied) the errors are swallowed so the API
 * still responds. Returns the run id when written.
 *
 * `value_category` ties a run to the ROI framework (the JD's "tag your projects
 * to defined value categories").
 */

export type LogRunInput = {
  workspaceId: string
  surface?: string
  valueCategory?: string
  input: Record<string, unknown>
  result: OrchestrationResult
}

export type UsageTotals = {
  promptTokens: number
  completionTokens: number
  latencyMs: number
  estCostUsd: number
}

export function totalUsage(result: OrchestrationResult): UsageTotals {
  let promptTokens = 0
  let completionTokens = 0
  let latencyMs = 0
  let estCostUsd = 0
  for (const u of result.usage) {
    promptTokens += u.promptTokens
    completionTokens += u.completionTokens
    latencyMs += u.latencyMs
    estCostUsd += estimateCostUsd(u.model, u.promptTokens, u.completionTokens)
  }
  return { promptTokens, completionTokens, latencyMs, estCostUsd }
}

/** Map an intent to a default ROI value category. */
export function defaultValueCategory(intent: string): string {
  switch (intent) {
    case 'career_fit':
      return 'career_research'
    case 'research':
    case 'summarize':
      return 'research_synthesis'
    case 'ask_context':
      return 'knowledge_retrieval'
    case 'rewrite':
      return 'content_production'
    case 'save_memory':
    case 'action':
      return 'workflow_automation'
    default:
      return 'general'
  }
}

export async function logAgentRun(
  supabase: AnyClient,
  userId: string,
  { workspaceId, surface, valueCategory, input, result }: LogRunInput,
): Promise<string | null> {
  const totals = totalUsage(result)
  const value_category = valueCategory ?? defaultValueCategory(result.intent)

  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data, error } = await (supabase.from('agent_runs') as any)
      .insert({
        user_id: userId,
        workspace_id: workspaceId || '',
        intent: result.intent,
        routed_by: result.routedBy,
        agents_used: result.agentsUsed,
        input,
        output: result.text.slice(0, 8000),
        status: 'completed',
        eval_pass: result.evaluation.pass,
        eval_notes: result.evaluation.notes,
        prompt_tokens: totals.promptTokens,
        completion_tokens: totals.completionTokens,
        latency_ms: totals.latencyMs,
        est_cost_usd: Number(totals.estCostUsd.toFixed(6)),
        value_category,
        surface: surface ?? 'api',
      })
      .select('id')
      .single()
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (error || !data) {
      console.error('[logAgentRun] insert failed:', error?.message ?? 'no row returned')
      return null
    }
    const runId: string = data.id

    if (result.usage.length) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await (supabase.from('ai_usage_events') as any).insert(
        result.usage.map((u) => ({
          user_id: userId,
          workspace_id: workspaceId || '',
          run_id: runId,
          agent: u.agent,
          provider: u.provider,
          model: u.model,
          prompt_tokens: u.promptTokens,
          completion_tokens: u.completionTokens,
          latency_ms: u.latencyMs,
          est_cost_usd: Number(estimateCostUsd(u.model, u.promptTokens, u.completionTokens).toFixed(6)),
          surface: surface ?? 'api',
        })),
      )
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }

    return runId
  } catch (err) {
    console.error('[logAgentRun] error:', (err as Error)?.message ?? err)
    return null
  }
}
