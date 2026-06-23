'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { withWorkspaceSlugs, DEFAULT_WORKSPACES } from '@/lib/workspaces'
import { isLegacyWorkspaceIdSegment, workspacePath } from '@/lib/workspace-routes'

function loadWorkspacesForRedirect() {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACES
  try {
    const raw = localStorage.getItem('inline-workspaces')
    const parsed = raw ? (JSON.parse(raw) as { id: string; label: string; slug?: string }[]) : []
    return withWorkspaceSlugs(parsed.length ? parsed : DEFAULT_WORKSPACES)
  } catch {
    return DEFAULT_WORKSPACES
  }
}

/** Replace legacy /app/ws-123/... URLs with slug-based paths. */
export default function WorkspaceSlugRedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const m = pathname.match(/^\/app\/([^/]+)(\/.*)?$/)
    if (!m) return
    const segment = decodeURIComponent(m[1]!)
    if (!isLegacyWorkspaceIdSegment(segment)) return

    const workspaces = loadWorkspacesForRedirect()
    const ws = workspaces.find(w => w.id === segment)
    if (!ws) return

    const tail = m[2] || '/dashboard'
    router.replace(workspacePath(ws) + tail)
  }, [pathname, router])

  return null
}
