import { extractCitationRefs } from '@/lib/ai/rag/retrieval'
import { runModel } from './runtime'
import type { AgentContext, AgentResult, AgentUsage } from './types'

/**
 * Evaluator agent — a guardrail that runs after the producing agent. It always
 * applies cheap deterministic checks (non-empty output, citations only point at
 * real sources, no completed action without confirmation) and can optionally
 * add an LLM-as-judge groundedness check. The Phase-7 eval harness reuses this
 * with `judge: true`.
 */

export type EvalReport = {
  pass: boolean
  notes: string
  usage: AgentUsage[]
}

const JUDGE_SYSTEM = `You are a strict QA reviewer for an AI assistant.
Given the user's REQUEST, the CONTEXT the answer was supposed to rely on, and the ANSWER, decide if the answer is grounded in the context and actually addresses the request.
Reply with exactly "PASS" or "FAIL: <short reason>" — nothing else.`

function buildJudgeContext(ctx: AgentContext, result: AgentResult): string {
  const parts: string[] = []
  if (result.sources?.length) {
    parts.push(result.sources.map((s) => `[${s.ref}] ${s.snippet}`).join('\n'))
  }
  const page = (ctx.selectedText || ctx.pageContent || '').slice(0, 4000)
  if (page) parts.push(page)
  return parts.join('\n\n').slice(0, 6000)
}

export async function evaluateResult(
  ctx: AgentContext,
  result: AgentResult,
  { judge = false }: { judge?: boolean } = {},
): Promise<EvalReport> {
  const notes: string[] = []
  const usage: AgentUsage[] = []
  let pass = true

  // 1. Output must be non-empty.
  if (!result.text || result.text.trim().length < 2) {
    pass = false
    notes.push('empty output')
  }

  // 2. Citations may only reference sources that exist.
  const refs = extractCitationRefs(result.text || '')
  const maxRef = result.sources?.length ?? 0
  const invalid = [...refs].filter((r) => r < 1 || r > maxRef)
  if (invalid.length) {
    pass = false
    notes.push(`cited nonexistent source(s): ${invalid.join(', ')}`)
  }

  // 3. No state change may complete without explicit confirmation.
  if (result.actions?.some((a) => a.status === 'completed') && !ctx.confirm) {
    pass = false
    notes.push('action completed without confirmation')
  }

  // 4. Optional groundedness judge (skipped if earlier checks already failed).
  const context = buildJudgeContext(ctx, result)
  if (pass && judge && context) {
    try {
      const { text, usage: judgeUsage } = await runModel({
        agent: 'evaluator',
        role: 'fast',
        system: JUDGE_SYSTEM,
        prompt: `REQUEST:\n${ctx.userPrompt}\n\nCONTEXT:\n${context}\n\nANSWER:\n${result.text}`,
        maxOutputTokens: 60,
        temperature: 0,
      })
      usage.push(judgeUsage)
      if (/^\s*fail/i.test(text)) {
        pass = false
        notes.push(`groundedness: ${text.trim().slice(0, 160)}`)
      }
    } catch {
      /* judge is best-effort — deterministic checks still stand */
    }
  }

  return { pass, notes: notes.join('; ') || 'ok', usage }
}
