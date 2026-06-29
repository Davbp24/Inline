import type { Metadata } from 'next'
import { Suspense } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Clock, ShieldCheck, Zap, Bot, Layers, Check, X } from 'lucide-react'
import PageHeader from '@/components/shell/PageHeader'
import KpiCard from '@/components/dashboard/KpiCard'
import { Skeleton } from '@/components/ui/skeleton'
import { getWorkspaceName } from '@/lib/workspaces'
import { resolveWorkspaceId, workspacePath } from '@/lib/workspace-routes'
import { fetchAgentUsageStats, fetchRecentAgentRuns } from '@/lib/data'

export const metadata: Metadata = { title: 'Usage' }

function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

const CATEGORY_LABELS: Record<string, string> = {
  career_research: 'Career research',
  research_synthesis: 'Research synthesis',
  knowledge_retrieval: 'Knowledge retrieval',
  content_production: 'Content production',
  workflow_automation: 'Workflow automation',
  general: 'General',
}

function BarRow({ label, value, max, suffix = '' }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="truncate font-medium text-foreground">{label}</span>
        <span className="shrink-0 text-muted-foreground">{value}{suffix}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 dark:border-sidebar-border dark:bg-secondary">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

async function UsageContent({ workspaceId }: { workspaceId: string }) {
  const [stats, runs] = await Promise.all([
    fetchAgentUsageStats(workspaceId),
    fetchRecentAgentRuns(workspaceId, 20),
  ])

  if (stats.totalRuns === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center dark:border-sidebar-border">
        <Bot className="mx-auto h-8 w-8 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium text-foreground">No agent activity yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Run the agents (Ask Inline, &ldquo;Is this role a fit?&rdquo;, or the Internship Tracker) and your
          activity, time saved, and evaluation results will appear here.
        </p>
      </div>
    )
  }

  const maxAgent = Math.max(...stats.byAgent.map(a => a.runs), 1)
  const maxCategory = Math.max(...stats.byValueCategory.map(c => c.runs), 1)
  const totalTokens = stats.totalPromptTokens + stats.totalCompletionTokens

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Agent runs"
          value={stats.totalRuns.toLocaleString()}
          icon={Activity}
          iconColor="text-blue-600"
          description={`${stats.activeDays} active day${stats.activeDays === 1 ? '' : 's'}`}
        />
        <KpiCard
          title="Time saved (est.)"
          value={formatMinutes(stats.minutesSaved)}
          icon={Clock}
          iconColor="text-emerald-600"
          description="Across all agent runs"
        />
        <KpiCard
          title="Eval pass rate"
          value={`${stats.evalPassRate}%`}
          icon={ShieldCheck}
          iconColor="text-violet-600"
          description="Evaluator-checked runs"
        />
        <KpiCard
          title="Tokens used"
          value={totalTokens.toLocaleString()}
          icon={Zap}
          iconColor="text-amber-600"
          description="Across all agent runs"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Runs by agent" subtitle="Per-agent model calls across all runs">
          {stats.byAgent.length === 0 ? (
            <p className="text-xs text-muted-foreground">No agent calls recorded.</p>
          ) : (
            <div className="space-y-3">
              {stats.byAgent.map(a => (
                <BarRow key={a.agent} label={a.agent} value={a.runs} max={maxAgent} />
              ))}
            </div>
          )}
        </Card>

        <Card title="Activity categories" subtitle="Runs and time saved, grouped by type">
          {stats.byValueCategory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No categorized runs yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.byValueCategory.map(c => (
                <BarRow
                  key={c.category}
                  label={`${CATEGORY_LABELS[c.category] ?? c.category} · ${formatMinutes(c.minutesSaved)} saved`}
                  value={c.runs}
                  max={maxCategory}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent runs" subtitle="Latest agent invocations">
        <div className="divide-y divide-border">
          {runs.map(run => (
            <div key={run.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span
                className={
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full ' +
                  (run.evalPass === false
                    ? 'bg-red-100 text-red-600 dark:bg-red-500/15'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15')
                }
                title={run.evalPass === false ? 'Evaluator flagged this run' : 'Passed evaluation'}
              >
                {run.evalPass === false ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {run.intent}
                  {run.agentsUsed.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {run.agentsUsed.join(' → ')}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {run.surface ?? 'api'} · {(run.latencyMs / 1000).toFixed(1)}s · {(run.promptTokens + run.completionTokens).toLocaleString()} tokens
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-muted-foreground">
                  {run.createdAt ? formatDistanceToNow(new Date(run.createdAt), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <Layers className="h-3 w-3" />
        Time saved is an estimate based on typical task length, not a measured value.
      </p>
    </div>
  )
}

export default async function UsagePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId: routeSegment } = await params
  const workspaceId = resolveWorkspaceId(routeSegment)
  const workspaceName = getWorkspaceName(workspaceId)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <PageHeader
        crumbs={[
          { label: workspaceName, href: workspacePath(workspaceId, 'dashboard') },
          { label: 'Usage' },
        ]}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            </div>
          }
        >
          <UsageContent workspaceId={workspaceId} />
        </Suspense>
      </div>
    </div>
  )
}
