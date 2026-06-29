/**
 * Inline agent eval harness.
 *
 * Runs three kinds of checks defined in lib/ai/evals/cases.json:
 *   - router:    intent classification matches the expected label
 *   - agent:     an agent's output satisfies assertions (needs an AI key)
 *   - evaluator: the evaluator guardrail returns the expected pass/fail
 *                (deterministic — runs without any AI key)
 *
 * Usage (from the web/ directory):
 *   npm run evals
 *
 * Results are printed and written to lib/ai/evals/results/.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import cases from '@/lib/ai/evals/cases.json'
import { routeIntent } from '@/lib/ai/agents/routerAgent'
import { evaluateResult } from '@/lib/ai/agents/evaluatorAgent'
import { researchAgent } from '@/lib/ai/agents/researchAgent'
import { rewriteAgent } from '@/lib/ai/agents/rewriteAgent'
import type { Agent, AgentContext, AgentIntent, AgentResult } from '@/lib/ai/agents/types'

type CaseStatus = 'pass' | 'fail' | 'skip'
type CaseResult = { id: string; kind: string; status: CaseStatus; detail: string }

/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal stub: the agents exercised here (router/rewrite/research/evaluator)
// don't touch Supabase. Memory/fit agents would need a real client.
const stubSupabase = {
  from() {
    return {
      select: () => ({ data: [], error: null, or: () => ({ data: [], error: null }) }),
      or: () => ({ data: [], error: null }),
    }
  },
} as any
/* eslint-enable @typescript-eslint/no-explicit-any */

const AGENTS: Record<string, Agent> = {
  research: researchAgent,
  rewrite: rewriteAgent,
}

function baseContext(partial: Partial<AgentContext>): AgentContext {
  return {
    userPrompt: '',
    workspaceId: '',
    userId: 'eval',
    supabase: stubSupabase,
    ...partial,
  }
}

function isMissingKey(err: unknown): boolean {
  return (err as Error)?.message?.includes('No AI provider API key') ?? false
}

async function runRouterCases(): Promise<CaseResult[]> {
  const out: CaseResult[] = []
  for (const c of cases.router as Array<{ id: string; userPrompt: string; expectedIntent: string }>) {
    try {
      const route = await routeIntent(baseContext({ userPrompt: c.userPrompt }))
      const ok = route.intent === c.expectedIntent
      out.push({
        id: c.id,
        kind: 'router',
        status: ok ? 'pass' : 'fail',
        detail: ok ? `→ ${route.intent} (${route.source})` : `expected ${c.expectedIntent}, got ${route.intent}`,
      })
    } catch (err) {
      out.push({ id: c.id, kind: 'router', status: 'fail', detail: (err as Error)?.message ?? 'error' })
    }
  }
  return out
}

async function runAgentCases(): Promise<CaseResult[]> {
  const out: CaseResult[] = []
  type AgentCase = {
    id: string
    agent: string
    intent?: AgentIntent
    context: Partial<AgentContext>
    assertions?: { minLength?: number; mustContain?: string[]; mustNotContain?: string[] }
  }
  for (const c of cases.agent as AgentCase[]) {
    const agent = AGENTS[c.agent]
    if (!agent) {
      out.push({ id: c.id, kind: 'agent', status: 'skip', detail: `unknown agent ${c.agent}` })
      continue
    }
    try {
      const ctx = baseContext({ ...c.context, intent: c.intent })
      const result = await agent.run(ctx)
      const text = result.text ?? ''
      const a = c.assertions ?? {}
      const failures: string[] = []
      if (a.minLength && text.trim().length < a.minLength) failures.push(`len<${a.minLength}`)
      for (const s of a.mustContain ?? []) {
        if (!text.toLowerCase().includes(s.toLowerCase())) failures.push(`missing "${s}"`)
      }
      for (const s of a.mustNotContain ?? []) {
        if (text.toLowerCase().includes(s.toLowerCase())) failures.push(`contains "${s}"`)
      }
      out.push({
        id: c.id,
        kind: 'agent',
        status: failures.length ? 'fail' : 'pass',
        detail: failures.length ? failures.join(', ') : `ok (${text.length} chars)`,
      })
    } catch (err) {
      out.push({
        id: c.id,
        kind: 'agent',
        status: isMissingKey(err) ? 'skip' : 'fail',
        detail: isMissingKey(err) ? 'no AI key — skipped' : (err as Error)?.message ?? 'error',
      })
    }
  }
  return out
}

async function runEvaluatorCases(): Promise<CaseResult[]> {
  const out: CaseResult[] = []
  type EvalCase = {
    id: string
    context: Partial<AgentContext> & { confirm?: boolean }
    result: AgentResult
    expectPass: boolean
  }
  for (const c of cases.evaluator as EvalCase[]) {
    try {
      const ctx = baseContext({ ...c.context, confirm: c.context.confirm })
      const report = await evaluateResult(ctx, c.result, { judge: false })
      const ok = report.pass === c.expectPass
      out.push({
        id: c.id,
        kind: 'evaluator',
        status: ok ? 'pass' : 'fail',
        detail: ok ? `pass=${report.pass} (${report.notes})` : `expected pass=${c.expectPass}, got ${report.pass} (${report.notes})`,
      })
    } catch (err) {
      out.push({ id: c.id, kind: 'evaluator', status: 'fail', detail: (err as Error)?.message ?? 'error' })
    }
  }
  return out
}

async function main() {
  const results = [
    ...(await runRouterCases()),
    ...(await runEvaluatorCases()),
    ...(await runAgentCases()),
  ]

  const counts = { pass: 0, fail: 0, skip: 0 }
  for (const r of results) {
    counts[r.status] += 1
    const icon = r.status === 'pass' ? 'PASS' : r.status === 'fail' ? 'FAIL' : 'SKIP'
    console.log(`[${icon}] ${r.id.padEnd(24)} ${r.kind.padEnd(10)} ${r.detail}`)
  }

  console.log(
    `\nEvals: ${counts.pass} passed, ${counts.fail} failed, ${counts.skip} skipped (${results.length} total)`,
  )

  const payload = {
    ranAt: new Date().toISOString(),
    summary: counts,
    results,
  }
  const dir = join(process.cwd(), 'lib', 'ai', 'evals', 'results')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'latest.json'), JSON.stringify(payload, null, 2))
  console.log(`\nWrote ${join('lib', 'ai', 'evals', 'results', 'latest.json')}`)

  // Non-zero exit when a real check failed (skips don't fail the run).
  process.exit(counts.fail > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Eval harness crashed:', err)
  process.exit(1)
})
