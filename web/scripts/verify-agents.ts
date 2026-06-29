/**
 * Quick local check: router + (optional) live agent call when GOOGLE_GENERATIVE_AI_API_KEY is set.
 * Usage: npx tsx scripts/verify-agents.ts
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { routeIntent } from '@/lib/ai/agents/routerAgent'
import { runAgentPipeline } from '@/lib/ai/agents/orchestrator'
import type { AgentContext } from '@/lib/ai/agents/types'

function loadEnvLocal() {
  const path = join(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i <= 0) continue
    const key = t.slice(0, i).trim()
    const val = t.slice(i + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

async function main() {
  const hasKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  console.log('GOOGLE_GENERATIVE_AI_API_KEY:', hasKey ? 'set' : 'MISSING')

  const stubSupabase = {
    from: () => ({ select: () => ({ data: [], error: null }) }),
  } as unknown as AgentContext['supabase']

  const route = await routeIntent({
    userPrompt: 'Is this role a fit for me?',
    workspaceId: 'ws-1',
    userId: 'verify-script',
    supabase: stubSupabase,
  })
  console.log('Router career_fit check:', route.intent === 'career_fit' ? 'PASS' : `FAIL (${route.intent})`)

  if (!hasKey) {
    console.log('\nSkipping live agent call — set GOOGLE_GENERATIVE_AI_API_KEY in web/.env.local')
    return
  }

  const ctx: AgentContext = {
    userPrompt: 'Is this role a fit for me, and what should I do next?',
    pageTitle: 'Software Engineer Intern',
    pageContent: 'We are hiring a software engineer intern with TypeScript, React, and API experience. You will build features with our team.',
    workspaceId: 'ws-1',
    userId: 'verify-script',
    supabase: stubSupabase,
    intent: 'career_fit',
  }

  console.log('\nRunning career_fit pipeline (may take ~10–20s)...')
  const result = await runAgentPipeline(ctx)
  console.log('Intent:', result.intent)
  console.log('Agents:', result.agentsUsed.join(' → '))
  console.log('Eval pass:', result.evaluation.pass)
  console.log('Output preview:', result.text.slice(0, 200).replace(/\s+/g, ' ') + '…')
  console.log('\nLive agent pipeline: OK')
  console.log('Note: Analytics time saved KPI updates after a signed-in /api/ai/route call persists to agent_runs.')
}

main().catch(err => {
  console.error('verify-agents failed:', (err as Error).message)
  process.exit(1)
})
