import { redirect } from 'next/navigation'
import { DEFAULT_WORKSPACES } from '@/lib/workspaces'
import { workspacePath } from '@/lib/workspace-routes'

/**
 * Legacy /app/history route. Now redirects to the user's first workspace
 * history page so that all RLS / workspace scoping in the grouped view works
 * as expected. Query params (e.g. ?q=...) are preserved.
 */
export default async function LegacyHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = (await searchParams) ?? {}
  const first = DEFAULT_WORKSPACES[0]!
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  redirect(workspacePath(first, 'history') + qs)
}
