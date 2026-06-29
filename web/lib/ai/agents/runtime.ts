import { generateText } from 'ai'
import { resolveModel, type ResolveModelOptions } from '@/lib/ai/providers'
import { INLINE_SHORT_PERSONA } from '@/lib/inline-persona'
import type { AgentUsage } from './types'

/**
 * Thin wrapper every agent uses to call an LLM. It resolves a model through the
 * provider layer, applies the shared Inline persona by default, and captures
 * token/latency usage so the orchestrator can persist it for the ROI dashboard.
 */

export type RunModelArgs = ResolveModelOptions & {
  /** Agent name recorded on the usage row. */
  agent: string
  /** System prompt; defaults to the short Inline persona. */
  system?: string
  prompt: string
  maxOutputTokens?: number
  temperature?: number
}

export type RunModelResult = {
  text: string
  usage: AgentUsage
}

export async function runModel(args: RunModelArgs): Promise<RunModelResult> {
  const resolved = await resolveModel({ role: args.role, provider: args.provider })
  if (!resolved) throw new Error('No AI provider API key configured.')

  const startedAt = Date.now()
  const result = await generateText({
    model: resolved.model,
    system: args.system ?? INLINE_SHORT_PERSONA,
    prompt: args.prompt,
    ...(args.maxOutputTokens ? { maxOutputTokens: args.maxOutputTokens } : {}),
    ...(args.temperature != null ? { temperature: args.temperature } : {}),
  })
  const latencyMs = Date.now() - startedAt

  return {
    text: result.text.trim(),
    usage: {
      agent: args.agent,
      provider: resolved.provider,
      model: resolved.modelId,
      promptTokens: result.usage?.inputTokens ?? 0,
      completionTokens: result.usage?.outputTokens ?? 0,
      latencyMs,
    },
  }
}

/** Extract the first JSON object/array from model output (handles code fences). */
export function parseJsonFromModel<T = unknown>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const match = candidate.match(/[{[][\s\S]*[}\]]/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}
