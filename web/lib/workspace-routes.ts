import {
  DEFAULT_WORKSPACES,
  findWorkspaceByRouteSegment,
  workspaceSlug,
  withWorkspaceSlugs,
  type WorkspaceLike,
} from '@/lib/workspaces'

export type { WorkspaceLike }

/** Map a URL segment (slug or legacy ws-* id) to the internal workspace id. */
export function resolveWorkspaceId(
  routeSegment: string,
  list: WorkspaceLike[] = DEFAULT_WORKSPACES,
): string {
  const ws = findWorkspaceByRouteSegment(routeSegment, list)
  if (ws) return ws.id
  const decoded = decodeURIComponent(routeSegment)
  if (decoded.startsWith('ws-')) return decoded
  return decoded
}

export function ensureUniqueWorkspaceSlug(
  base: string,
  workspaces: WorkspaceLike[],
  excludeId?: string,
): string {
  const used = new Set(
    workspaces.filter(w => w.id !== excludeId).map(w => workspaceSlug(w)),
  )
  let slug = base
  let n = 2
  while (used.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  return slug
}

/** Build a workspace-scoped app path using the slug (never ws-*). */
export function workspacePath(
  workspace: WorkspaceLike | string,
  ...segments: string[]
): string {
  let ws: WorkspaceLike | undefined
  if (typeof workspace === 'string') {
    ws =
      findWorkspaceByRouteSegment(workspace) ??
      DEFAULT_WORKSPACES.find(w => w.id === workspace)
    if (!ws) {
      return ['/app', workspace, ...segments.filter(Boolean)].join('/')
    }
  } else {
    ws = workspace
  }
  const slug = workspaceSlug(ws)
  const tail = segments.filter(Boolean).join('/')
  return tail ? `/app/${slug}/${tail}` : `/app/${slug}`
}

export function getWorkspaceSlugFromPath(pathname: string | null): string {
  if (!pathname) return workspaceSlug(DEFAULT_WORKSPACES[0]!)
  const m = pathname.match(/\/app\/([^/]+)/)
  return m ? decodeURIComponent(m[1]!) : workspaceSlug(DEFAULT_WORKSPACES[0]!)
}

export function isLegacyWorkspaceIdSegment(segment: string): boolean {
  return /^ws-/.test(decodeURIComponent(segment))
}

/** Resolve internal workspace id from the current browser path (client-safe). */
export function resolveWorkspaceIdFromBrowserPath(
  pathname: string | null,
  fallbackList: WorkspaceLike[] = DEFAULT_WORKSPACES,
): string {
  const segment = getWorkspaceSlugFromPath(pathname)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('inline-workspaces')
      if (raw) {
        const list = withWorkspaceSlugs(JSON.parse(raw) as WorkspaceLike[])
        return resolveWorkspaceId(segment, list)
      }
    } catch {
      /* use defaults */
    }
  }
  return resolveWorkspaceId(segment, fallbackList)
}

export {
  findWorkspaceByRouteSegment,
  slugifyWorkspaceLabel,
  workspaceSlug,
} from '@/lib/workspaces'
