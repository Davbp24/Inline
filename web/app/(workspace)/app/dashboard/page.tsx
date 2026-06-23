import { redirect } from 'next/navigation'
import { DEFAULT_WORKSPACES } from '@/lib/workspaces'
import { workspacePath } from '@/lib/workspace-routes'

export default function DashboardRedirectPage() {
  const first = DEFAULT_WORKSPACES[0]
  redirect(workspacePath(first ?? 'marketing-team', 'dashboard'))
}
