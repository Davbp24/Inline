/**
 * Data access layer for the dashboard.
 *
 * All public functions accept an optional `workspaceId` parameter.
 * When provided, queries are scoped to that workspace via workspace_id = ?.
 * Falls back to MOCK_* data when NEXT_PUBLIC_SUPABASE_URL is not configured.
 */
import type { Note, DashboardStats } from './types'
import type { Database } from './supabase/types'
import {
  MOCK_NOTES,
  MOCK_DASHBOARD_STATS,
} from './mock-data'

export const HAS_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
export async function fetchNotes(workspaceId?: string): Promise<Note[]> {
  if (!HAS_SUPABASE) return MOCK_NOTES

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sb = supabase as any
  let query = sb.from('notes').select('*').order('created_at', { ascending: false })
  if (workspaceId) query = query.eq('workspace_id', workspaceId)
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const result = await query
  if (result.error || !result.data) return MOCK_NOTES

  type NoteRow = Database['public']['Tables']['notes']['Row']
  const data = result.data as NoteRow[]

  return data.map(n => ({
    id:          n.id,
    pageUrl:     n.page_url,
    domain:      n.domain,
    pageTitle:   n.page_title ?? '',
    pageContext: n.page_context ?? '',
    content:     n.content,
    type:        n.type as Note['type'],
    color:       n.color,
    x:           n.pos_x,
    y:           n.pos_y,
    width:       n.width,
    height:      n.height,
    tags:        n.tags,
    is_pinned:   n.is_pinned,
    lat:         n.lat ?? undefined,
    lng:         n.lng ?? undefined,
    createdAt:   n.created_at,
    updatedAt:   n.updated_at,
  }))
}

// ---------------------------------------------------------------------------
// Auto-generated page recap documents (workspace-scoped)
// ---------------------------------------------------------------------------
export interface RecapDocRef {
  id: string
  title: string
  updatedAt: string
  pageUrl: string
}

export async function fetchRecapsByPageUrl(workspaceId: string): Promise<Record<string, RecapDocRef>> {
  if (!HAS_SUPABASE) return {}
  try {
    const { createClient } = await import('./supabase/server')
    const supabase = await createClient()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const sb = supabase as any
    const { data } = await sb.from('documents')
      .select('id, title, updated_at, page_url')
      .eq('workspace_id', workspaceId)
      .eq('auto_generated', true)
      .not('page_url', 'is', null)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (!Array.isArray(data)) return {}
    const map: Record<string, RecapDocRef> = {}
    for (const d of data as { id: string; title: string; updated_at: string; page_url: string }[]) {
      if (!d.page_url) continue
      map[d.page_url] = {
        id: d.id,
        title: d.title,
        updatedAt: d.updated_at,
        pageUrl: d.page_url,
      }
    }
    return map
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Dashboard Stats (workspace-scoped)
// ---------------------------------------------------------------------------
export async function fetchDashboardStats(workspaceId?: string): Promise<DashboardStats> {
  if (!HAS_SUPABASE) return MOCK_DASHBOARD_STATS

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()

  const now      = new Date()
  const week     = new Date(now); week.setDate(now.getDate() - 7)
  const prevWeek = new Date(now); prevWeek.setDate(now.getDate() - 14)

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sb = supabase as any
  const base = (sel: string, opts?: Record<string, unknown>) => {
    let q = sb.from('notes').select(sel, opts)
    if (workspaceId) q = q.eq('workspace_id', workspaceId)
    return q
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const [
    { count: totalNotes },
    { count: notesThisWeek },
    { count: notesPrevWeek },
    { data: domainRowsRaw },
    { count: aiCount },
  ] = await Promise.all([
    base('*', { count: 'exact', head: true }),
    base('*', { count: 'exact', head: true }).gte('created_at', week.toISOString()),
    base('*', { count: 'exact', head: true })
      .gte('created_at', prevWeek.toISOString())
      .lt('created_at', week.toISOString()),
    base('domain, created_at'),
    sb.from('extractions').select('*', { count: 'exact', head: true }).eq('schema_type', 'ai-summary'),
  ])

  const { data: typeRowsRaw } = await base('type')
  const typeRows = (typeRowsRaw ?? []) as { type: string }[]
  const typeCounts: Record<string, number> = {}
  for (const row of typeRows) {
    typeCounts[row.type] = (typeCounts[row.type] ?? 0) + 1
  }

  const domainRows = (domainRowsRaw ?? []) as { domain: string; created_at: string }[]

  // Domain frequency map
  const domainMap: Record<string, number> = {}
  for (const row of domainRows) {
    domainMap[row.domain] = (domainMap[row.domain] ?? 0) + 1
  }
  const total = Object.values(domainMap).reduce((a, b) => a + b, 0) || 1
  const topDomains = Object.entries(domainMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / total) * 100),
      lastVisited: new Date().toISOString(),
    }))

  // 30-day capture history
  const captureHistory = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = domainRows.filter(r => r.created_at.startsWith(dateStr)).length
    return { date: dateStr, count }
  })

  // Week-over-week delta (percentage)
  const thisWeekCount = notesThisWeek ?? 0
  const prevWeekCount = notesPrevWeek ?? 0
  const notesThisWeekDelta = prevWeekCount === 0
    ? 0
    : Math.round(((thisWeekCount - prevWeekCount) / prevWeekCount) * 100)

  // Streak: count consecutive days with at least one capture (from today backwards)
  let streakDays = 0
  for (let i = captureHistory.length - 1; i >= 0; i--) {
    if (captureHistory[i].count > 0) streakDays++
    else break
  }

  return {
    notesThisWeek:      thisWeekCount,
    notesThisWeekDelta,
    totalNotes:         totalNotes ?? 0,
    totalDomains:       Object.keys(domainMap).length,
    aiQueriesRun:       aiCount ?? 0,
    streakDays,
    captureHistory,
    topDomains,
    typeCounts: typeCounts as DashboardStats['typeCounts'],
  }
}

// ---------------------------------------------------------------------------
// Workspace-scoped analytics: daily captures for a rolling N-day window
// ---------------------------------------------------------------------------
export async function fetchCaptureTimeSeries(
  workspaceId?: string,
  days = 30,
): Promise<{ date: string; count: number; ai: number }[]> {
  if (!HAS_SUPABASE) {
    // Generate plausible-looking mock data
    const now = new Date()
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - 1 - i))
      return {
        date:  d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 12),
        ai:    Math.floor(Math.random() * 4),
      }
    })
  }

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()

  const since = new Date()
  since.setDate(since.getDate() - (days - 1))

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sb = supabase as any
  let q = sb.from('notes').select('created_at, type').gte('created_at', since.toISOString())
  if (workspaceId) q = q.eq('workspace_id', workspaceId)
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const { data } = await q

  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().split('T')[0]
    type Row = { created_at: string; type: string }
    const dayRows = ((data ?? []) as Row[]).filter(r => r.created_at.startsWith(dateStr))
    return {
      date:  dateStr,
      count: dayRows.length,
      ai:    dayRows.filter(r => r.type === 'ai-summary').length,
    }
  })
}

// ---------------------------------------------------------------------------
// Note detail (history page)
// ---------------------------------------------------------------------------
export async function fetchNoteById(noteId: string, workspaceId?: string): Promise<Note | null> {
  if (!HAS_SUPABASE) return MOCK_NOTES.find(n => n.id === noteId) ?? null

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sb = supabase as any

  async function load(withWorkspace: boolean) {
    let q = sb.from('notes').select('*').eq('id', noteId)
    if (withWorkspace && workspaceId) q = q.eq('workspace_id', workspaceId)
    return q.maybeSingle()
  }

  let { data, error } = await load(true)
  if ((!data || error) && workspaceId) {
    ;({ data, error } = await load(false))
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (error || !data) {
    return MOCK_NOTES.find(n => n.id === noteId) ?? null
  }

  type NoteRow = Database['public']['Tables']['notes']['Row']
  const n = data as NoteRow
  return {
    id:          n.id,
    pageUrl:     n.page_url,
    domain:      n.domain,
    pageTitle:   n.page_title ?? '',
    pageContext: n.page_context ?? '',
    content:     n.content,
    type:        n.type as Note['type'],
    color:       n.color,
    x:           n.pos_x,
    y:           n.pos_y,
    width:       n.width,
    height:      n.height,
    tags:        n.tags,
    is_pinned:   n.is_pinned,
    lat:         n.lat ?? undefined,
    lng:         n.lng ?? undefined,
    createdAt:   n.created_at,
    updatedAt:   n.updated_at,
  }
}

export interface Extraction {
  id:         string
  schemaType: string
  domain:     string
  pageUrl:    string
  data:       unknown
  createdAt:  string
}

export async function fetchExtractionsForNote(noteId: string): Promise<Extraction[]> {
  if (!HAS_SUPABASE) return []

  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sb = supabase as any
  const { data, error } = await sb
    .from('extractions')
    .select('*')
    .eq('note_id', noteId)
    .order('created_at', { ascending: false })
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (error || !data) return []

  type ExRow = { id: string; schema_type: string; domain: string; page_url: string; data: unknown; created_at: string }
  return (data as ExRow[]).map(e => ({
    id:         e.id,
    schemaType: e.schema_type,
    domain:     e.domain,
    pageUrl:    e.page_url,
    data:       e.data,
    createdAt:  e.created_at,
  }))
}

// ---------------------------------------------------------------------------
// Agent usage metrics (multi-agent system)
// ---------------------------------------------------------------------------

/** Estimated minutes a completed run of each intent saves the user. */
const MINUTES_SAVED_BY_INTENT: Record<string, number> = {
  career_fit: 12,
  research: 5,
  summarize: 5,
  ask_context: 3,
  rewrite: 2,
  save_memory: 1,
  action: 1,
}

export interface AgentUsageStats {
  totalRuns: number
  evalPassRate: number
  totalPromptTokens: number
  totalCompletionTokens: number
  minutesSaved: number
  activeDays: number
  byAgent: { agent: string; runs: number }[]
  byIntent: { intent: string; runs: number }[]
  byValueCategory: { category: string; runs: number; minutesSaved: number }[]
}

const EMPTY_AGENT_STATS: AgentUsageStats = {
  totalRuns: 0,
  evalPassRate: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  minutesSaved: 0,
  activeDays: 0,
  byAgent: [],
  byIntent: [],
  byValueCategory: [],
}

export async function fetchAgentUsageStats(workspaceId?: string): Promise<AgentUsageStats> {
  if (!HAS_SUPABASE) return EMPTY_AGENT_STATS

  try {
    const { createClient } = await import('./supabase/server')
    const supabase = await createClient()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const sb = supabase as any

    let runsQ = sb
      .from('agent_runs')
      .select('intent, value_category, eval_pass, prompt_tokens, completion_tokens, created_at')
      .order('created_at', { ascending: false })
      .limit(2000)
    if (workspaceId) runsQ = runsQ.or(`workspace_id.eq.${workspaceId},workspace_id.eq.`)

    const { data: runs, error } = await runsQ
    if (error || !runs) return EMPTY_AGENT_STATS

    type RunRow = {
      intent: string
      value_category: string | null
      eval_pass: boolean | null
      prompt_tokens: number
      completion_tokens: number
      created_at: string
    }
    const rows = runs as RunRow[]

    const intentCounts: Record<string, number> = {}
    const categoryRuns: Record<string, number> = {}
    const categoryMinutes: Record<string, number> = {}
    const days = new Set<string>()
    let totalPromptTokens = 0
    let totalCompletionTokens = 0
    let minutesSaved = 0
    let evalChecked = 0
    let evalPassed = 0

    for (const r of rows) {
      intentCounts[r.intent] = (intentCounts[r.intent] ?? 0) + 1
      totalPromptTokens += r.prompt_tokens ?? 0
      totalCompletionTokens += r.completion_tokens ?? 0
      const mins = MINUTES_SAVED_BY_INTENT[r.intent] ?? 2
      minutesSaved += mins
      const cat = r.value_category ?? 'general'
      categoryRuns[cat] = (categoryRuns[cat] ?? 0) + 1
      categoryMinutes[cat] = (categoryMinutes[cat] ?? 0) + mins
      if (r.eval_pass !== null) {
        evalChecked += 1
        if (r.eval_pass) evalPassed += 1
      }
      if (r.created_at) days.add(r.created_at.slice(0, 10))
    }

    let evQ = sb.from('ai_usage_events').select('agent').limit(5000)
    if (workspaceId) evQ = evQ.or(`workspace_id.eq.${workspaceId},workspace_id.eq.`)
    const { data: events } = await evQ
    const agentCounts: Record<string, number> = {}
    for (const e of (events ?? []) as { agent: string }[]) {
      agentCounts[e.agent] = (agentCounts[e.agent] ?? 0) + 1
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const sortDesc = (a: { runs: number }, b: { runs: number }) => b.runs - a.runs

    return {
      totalRuns: rows.length,
      evalPassRate: evalChecked ? Math.round((evalPassed / evalChecked) * 100) : 0,
      totalPromptTokens,
      totalCompletionTokens,
      minutesSaved,
      activeDays: days.size,
      byAgent: Object.entries(agentCounts).map(([agent, runs]) => ({ agent, runs })).sort(sortDesc),
      byIntent: Object.entries(intentCounts).map(([intent, runs]) => ({ intent, runs })).sort(sortDesc),
      byValueCategory: Object.entries(categoryRuns)
        .map(([category, runs]) => ({ category, runs, minutesSaved: categoryMinutes[category] ?? 0 }))
        .sort(sortDesc),
    }
  } catch {
    return EMPTY_AGENT_STATS
  }
}

export interface AgentRunRow {
  id: string
  intent: string
  agentsUsed: string[]
  evalPass: boolean | null
  latencyMs: number
  promptTokens: number
  completionTokens: number
  valueCategory: string | null
  surface: string | null
  createdAt: string
}

export async function fetchRecentAgentRuns(workspaceId?: string, limit = 20): Promise<AgentRunRow[]> {
  if (!HAS_SUPABASE) return []

  try {
    const { createClient } = await import('./supabase/server')
    const supabase = await createClient()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const sb = supabase as any
    let q = sb
      .from('agent_runs')
      .select('id, intent, agents_used, eval_pass, latency_ms, prompt_tokens, completion_tokens, value_category, surface, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (workspaceId) q = q.or(`workspace_id.eq.${workspaceId},workspace_id.eq.`)
    const { data, error } = await q
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (error || !data) return []

    type Row = {
      id: string
      intent: string
      agents_used: string[] | null
      eval_pass: boolean | null
      latency_ms: number
      prompt_tokens: number
      completion_tokens: number
      value_category: string | null
      surface: string | null
      created_at: string
    }
    return (data as Row[]).map(r => ({
      id: r.id,
      intent: r.intent,
      agentsUsed: r.agents_used ?? [],
      evalPass: r.eval_pass,
      latencyMs: r.latency_ms ?? 0,
      promptTokens: r.prompt_tokens ?? 0,
      completionTokens: r.completion_tokens ?? 0,
      valueCategory: r.value_category,
      surface: r.surface,
      createdAt: r.created_at,
    }))
  } catch {
    return []
  }
}
