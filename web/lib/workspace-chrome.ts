/** Workspace or account settings — collapsed app nav + settings nav side by side. */
export function isStandaloneSettingsPath(pathname: string): boolean {
  const path = pathname.split('?')[0] ?? pathname
  if (path === '/app/settings') return true
  return /^\/app\/[^/]+\/settings\/?$/.test(path)
}
