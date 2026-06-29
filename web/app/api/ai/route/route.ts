import { NextResponse } from 'next/server'
import { getSupabaseAndUserFromRequest } from '@/lib/ai-key'
import { runAgentGraph } from '@/lib/ai/graph'
import { logAgentRun, totalUsage } from '@/lib/ai/agents/persistence'
import { AGENT_INTENTS, type AgentContext, type AgentIntent } from '@/lib/ai/agents/types'

/**
 * POST /api/ai/route — the multi-agent coordinator endpoint (LangGraph).
 *
 * Body:
 *   { userPrompt, selectedText?, pageUrl?, pageTitle?, pageContent?,
 *     workspaceId?, intent?, confirm?, params?, surface?, threadId? }
 *
 * Flow: auth -> LangGraph (router -> agent -> evaluate, with a human-in-the-loop
 * interrupt on state-changing actions) -> run + usage persisted -> JSON.
 *
 * Human-in-the-loop: a state-changing request without `confirm: true` pauses and
 * returns `{ needsConfirmation: true, threadId, interrupt }`. Re-POST the same
 * `threadId` with `confirm: true` to approve (or `confirm: false` to reject) and
 * the run resumes from the checkpoint.
 */

const MAX_PROMPT_CHARS = 8000
const MAX_PAGE_CHARS = 16000

export async function POST(request: Request) {
  const { user, supabase } = await getSupabaseAndUserFromRequest(request)
  if (!user || !supabase) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let body: any
  /* eslint-enable @typescript-eslint/no-explicit-any */
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const userPrompt = typeof body.userPrompt === 'string' ? body.userPrompt.slice(0, MAX_PROMPT_CHARS) : ''
  const selectedText = typeof body.selectedText === 'string' ? body.selectedText.slice(0, MAX_PAGE_CHARS) : undefined

  // A threadId means "resume an interrupted run" (the checkpoint already holds
  // the original prompt/state), so the prompt/selection requirement is skipped.
  const threadId = typeof body.threadId === 'string' && body.threadId.trim() ? body.threadId.trim() : undefined
  const isResume = Boolean(threadId)

  if (!isResume && !userPrompt.trim() && !selectedText?.trim()) {
    return NextResponse.json({ error: 'userPrompt or selectedText is required' }, { status: 400 })
  }

  const intent: AgentIntent | undefined =
    typeof body.intent === 'string' && (AGENT_INTENTS as string[]).includes(body.intent)
      ? (body.intent as AgentIntent)
      : undefined

  const ctx: AgentContext = {
    userPrompt,
    selectedText,
    pageUrl: typeof body.pageUrl === 'string' ? body.pageUrl : undefined,
    pageTitle: typeof body.pageTitle === 'string' ? body.pageTitle : undefined,
    pageContent: typeof body.pageContent === 'string' ? body.pageContent.slice(0, MAX_PAGE_CHARS) : undefined,
    workspaceId: typeof body.workspaceId === 'string' ? body.workspaceId : '',
    userId: user.id,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    supabase: supabase as any,
    intent,
    confirm: body.confirm === true,
    params: body.params && typeof body.params === 'object' ? body.params : undefined,
  }

  try {
    // Resume an interrupted run (confirm:true approves, confirm:false rejects),
    // otherwise start a fresh run on a new thread.
    const result = await runAgentGraph(ctx, {
      threadId,
      resume: isResume ? (ctx.confirm ? true : { approved: false }) : undefined,
    })
    const { estCostUsd: _cost, ...usageTotals } = totalUsage(result)

    // Paused for human approval: nothing was executed or logged yet. Surface the
    // thread id + interrupt so the caller can re-POST with confirm to resume.
    if (result.interrupt) {
      return NextResponse.json({
        runId: null,
        threadId: result.threadId,
        needsConfirmation: true,
        interrupt: result.interrupt,
        intent: result.intent,
        routedBy: result.routedBy,
        agentsUsed: result.agentsUsed,
        text: result.text,
        sources: result.sources,
        actions: result.actions,
        data: result.data,
        evaluation: result.evaluation,
        usage: { ...usageTotals, calls: result.usage },
      })
    }

    const runId = await logAgentRun(
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      supabase as any,
      user.id,
      {
        workspaceId: ctx.workspaceId,
        surface: typeof body.surface === 'string' ? body.surface : 'api',
        input: {
          userPrompt,
          pageUrl: ctx.pageUrl ?? null,
          pageTitle: ctx.pageTitle ?? null,
          hasSelection: Boolean(selectedText),
          confirm: ctx.confirm ?? false,
        },
        result,
      },
    )

    return NextResponse.json({
      runId,
      threadId: result.threadId,
      intent: result.intent,
      routedBy: result.routedBy,
      agentsUsed: result.agentsUsed,
      text: result.text,
      sources: result.sources,
      actions: result.actions,
      data: result.data,
      evaluation: result.evaluation,
      usage: { ...usageTotals, calls: result.usage },
    })
  } catch (err: unknown) {
    const message = (err as Error)?.message ?? ''
    if (message.includes('No AI provider API key')) {
      return NextResponse.json({ error: 'No AI API key configured.' }, { status: 403 })
    }
    const status = (err as { statusCode?: number })?.statusCode
    if (status === 429) {
      return NextResponse.json({ error: 'Inline AI is busy right now. Please try again in a few minutes.' }, { status: 429 })
    }
    console.error('[ai/route] error:', message)
    return NextResponse.json({ error: 'Agent request failed.' }, { status: 500 })
  }
}
