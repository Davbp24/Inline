// Shared workspace definitions — used by both Sidebar (client) and server pages

export interface WorkspaceDef {
  id: string
  label: string
  slug: string
  color: string
  icon: string
}

export const DEFAULT_WORKSPACES: WorkspaceDef[] = [
  { id: 'ws-1', slug: 'marketing-team', label: 'Marketing Team', color: '#f43f5e', icon: 'Megaphone' },
  { id: 'ws-2', slug: 'product-development', label: 'Product Development', color: '#6C91C2', icon: 'Package' },
  { id: 'ws-3', slug: 'sales-strategy', label: 'Sales Strategy', color: '#f59e0b', icon: 'TrendingUp' },
  { id: 'ws-4', slug: 'project-management', label: 'Project Management', color: '#5FA8A1', icon: 'FolderKanban' },
  { id: 'ws-5', slug: 'research-insights', label: 'Research & Insights', color: '#a855f7', icon: 'Lightbulb' },
]

export type WorkspaceLike = Pick<WorkspaceDef, 'id' | 'label' | 'slug'>

/** URL-safe segment from a workspace display name. */
export function slugifyWorkspaceLabel(label: string): string {
  const base = label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'workspace'
}

export function workspaceSlug(ws: WorkspaceLike): string {
  if (ws.slug) return ws.slug
  return slugifyWorkspaceLabel(ws.label)
}

export function findWorkspaceByRouteSegment(
  segment: string,
  list: WorkspaceLike[] = DEFAULT_WORKSPACES,
): WorkspaceDef | undefined {
  const decoded = decodeURIComponent(segment)
  const byId = list.find(w => w.id === decoded)
  if (byId) return byId as WorkspaceDef
  return list.find(w => workspaceSlug(w) === decoded) as WorkspaceDef | undefined
}

export function getWorkspaceName(idOrRouteSegment: string): string {
  const ws = findWorkspaceByRouteSegment(idOrRouteSegment)
  if (ws) return ws.label
  if (idOrRouteSegment.startsWith('ws-')) {
    return idOrRouteSegment.replace(/^ws-/, 'Workspace ')
  }
  const decoded = decodeURIComponent(idOrRouteSegment)
  if (decoded.includes('-')) {
    const head = decoded.split('-')[0] ?? decoded
    return head.charAt(0).toUpperCase() + head.slice(1)
  }
  return decoded.charAt(0).toUpperCase() + decoded.slice(1)
}

export function getWorkspaceColor(id: string): string {
  const ws = findWorkspaceByRouteSegment(id) ?? DEFAULT_WORKSPACES.find(w => w.id === id)
  return ws?.color ?? '#6C91C2'
}

/** Ensure stored workspaces have stable slugs (client localStorage migration). */
export function withWorkspaceSlugs<T extends { id: string; label: string; slug?: string }>(
  workspaces: T[],
): (T & { slug: string })[] {
  const used = new Set<string>()
  return workspaces.map(ws => {
    let slug = ws.slug ?? slugifyWorkspaceLabel(ws.label)
    if (used.has(slug)) {
      let n = 2
      while (used.has(`${slug}-${n}`)) n += 1
      slug = `${slug}-${n}`
    }
    used.add(slug)
    return { ...ws, slug }
  })
}
