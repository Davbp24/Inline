/** Public support contact for privacy, access, and deletion requests. */
export const SUPPORT_EMAIL = 'ryanlyncee29@gmail.com'

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`

/** Chrome Web Store listing URL — set after approval via NEXT_PUBLIC_CHROME_WEB_STORE_URL. */
export function getChromeWebStoreUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL?.trim()
  if (!raw) return null
  return raw.replace(/\/$/, '')
}
