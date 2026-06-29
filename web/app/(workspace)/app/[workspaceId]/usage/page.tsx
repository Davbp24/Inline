import { redirect } from 'next/navigation'
import { resolveWorkspaceId, workspacePath } from '@/lib/workspace-routes'

/** Legacy /usage route — redirects to Analytics (time saved lives on Charts tab). */
export default async function UsageRedirectPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId: routeSegment } = await params
  const workspaceId = resolveWorkspaceId(routeSegment)
  redirect(workspacePath(workspaceId, 'analytics'))
}
