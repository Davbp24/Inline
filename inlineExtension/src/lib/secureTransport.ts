const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function isSecureTransportUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    if (url.protocol === 'https:' || url.protocol === 'wss:') return true
    if ((url.protocol === 'http:' || url.protocol === 'ws:') && LOCAL_HOSTS.has(url.hostname)) return true
  } catch {
    return false
  }
  return false
}

export function assertSecureTransport(rawUrl: string): void {
  if (isSecureTransportUrl(rawUrl)) return
  throw new Error('Inline blocks non-local insecure network requests. Use HTTPS for synced workspace and AI requests.')
}

export function normalizeSecureBase(rawUrl: string): string {
  const base = rawUrl.replace(/\/$/, '')
  assertSecureTransport(base)
  return base
}
