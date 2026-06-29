import { NextResponse } from 'next/server'
import { getSupabaseAndUserFromRequest } from '@/lib/ai-key'
import { runAgentPipeline } from '@/lib/ai/agents/orchestrator'
import { logAgentRun } from '@/lib/ai/agents/persistence'
import { exportToNotion } from '@/lib/ai/tools/exportToNotion'
import type { AgentContext } from '@/lib/ai/agents/types'

/**
 * POST /api/automation/internship — the "Internship Tracker" automation.
 *
 * Runs the career-fit agent flow on a job page, extracts structured role
 * fields, saves a tracked extraction, optionally exports to Notion, and logs an
 * automation_run tagged to the career_research value category.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type RoleData = {
  title?: string
  company?: string
  deadline?: string
  skills?: string[]
  responsibilities?: string[]
}

export async function POST(request: Request) {
  const { user, supabase } = await getSupabaseAndUserFromRequest(request)
  if (!user || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl : ''
  const pageTitle = typeof body.pageTitle === 'string' ? body.pageTitle : ''
  const pageContent = typeof body.pageContent === 'string' ? body.pageContent.slice(0, 16000) : ''
  const selectedText = typeof body.selectedText === 'string' ? body.selectedText.slice(0, 16000) : ''
  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : ''
  const wantNotion = body.exportToNotion === true

  if (!pageContent.trim() && !selectedText.trim()) {
    return NextResponse.json({ error: 'pageContent or selectedText is required' }, { status: 400 })
  }

  const ctx: AgentContext = {
    userPrompt: 'Is this role a fit for me, and what should I do next?',
    selectedText: selectedText || undefined,
    pageUrl: pageUrl || undefined,
    pageTitle: pageTitle || undefined,
    pageContent: pageContent || undefined,
    workspaceId,
    userId: user.id,
    supabase: supabase as any,
    intent: 'career_fit',
  }

  let domain = ''
  if (pageUrl) {
    try { domain = new URL(pageUrl).hostname } catch { /* not a URL */ }
  }

  try {
    const result = await runAgentPipeline(ctx)
    const role = (result.data?.role as RoleData) ?? {}

    const runId = await logAgentRun(supabase as any, user.id, {
      workspaceId,
      surface: 'automation:internship',
      valueCategory: 'career_research',
      input: { pageUrl, pageTitle, hasSelection: Boolean(selectedText) },
      result,
    })

    // Save a tracked extraction (best-effort).
    try {
      await (supabase.from('extractions') as any).insert({
        user_id: user.id,
        note_id: null,
        page_url: pageUrl || '',
        domain: domain || '',
        source_text: (selectedText || pageContent).slice(0, 8000),
        schema_type: 'internship',
        data: {
          ...role,
          fit: result.text,
          analyzedAt: new Date().toISOString(),
        },
      })
    } catch {
      /* extraction logging is best-effort */
    }

    // Optional Notion export.
    let notion: { ok: boolean; url?: string; error?: string } | null = null
    if (wantNotion) {
      notion = await exportToNotion(supabase as any, user.id, workspaceId, {
        title: role.title ? `${role.title}${role.company ? ` — ${role.company}` : ''}` : pageTitle || 'Internship',
        contentMarkdown: result.text,
        properties: {
          Company: role.company ?? null,
          Role: role.title ?? null,
          Deadline: role.deadline ?? null,
          Skills: role.skills ?? null,
          URL: pageUrl || null,
        },
      })
    }

    // Log the automation run (best-effort).
    try {
      await (supabase.from('automation_runs') as any).insert({
        user_id: user.id,
        workspace_id: workspaceId,
        kind: 'internship_tracker',
        status: 'completed',
        input: { pageUrl, pageTitle },
        output: { role, notionUrl: notion?.url ?? null, evalPass: result.evaluation.pass },
        run_id: runId,
        value_category: 'career_research',
      })
    } catch {
      /* automation logging is best-effort */
    }

    return NextResponse.json({
      runId,
      role,
      fit: result.text,
      sources: result.sources,
      evaluation: result.evaluation,
      notion,
    })
  } catch (err: unknown) {
    const message = (err as Error)?.message ?? ''
    if (message.includes('No AI provider API key')) {
      return NextResponse.json({ error: 'No AI API key configured.' }, { status: 403 })
    }
    console.error('[automation/internship] error:', message)
    return NextResponse.json({ error: 'Automation failed.' }, { status: 500 })
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
