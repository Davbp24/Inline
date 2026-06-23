/** Hosted production origin for share links, auth redirects, and extension sync. */
export const INLINE_PRODUCTION_ORIGIN = 'https://useinline.vercel.app'

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  return process.env.NODE_ENV === 'production'
    ? INLINE_PRODUCTION_ORIGIN
    : 'http://localhost:3000'
}

/**
 * Express annotation backend. On Vercel, leave unset so the extension uses the
 * same origin and Next rewrites `/api/annotations` to ANNOTATION_API_ORIGIN.
 */
export function getInlineBackendUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_INLINE_BACKEND_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  return process.env.NODE_ENV === 'production'
    ? INLINE_PRODUCTION_ORIGIN
    : 'http://localhost:3030'
}

/** Client-side backend base for extension auth handoff. */
export function resolveExtensionBackendBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_INLINE_BACKEND_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return window.location.origin
  }
  return getInlineBackendUrl()
}
