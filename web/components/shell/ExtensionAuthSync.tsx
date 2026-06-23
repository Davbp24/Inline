'use client'

/**
 * Pushes the current Supabase session and active workspace id to the Inline
 * Chrome extension so the extension can save annotations under the logged-in
 * user. Without this handoff the extension has no access token, the backend
 * falls back to the anon client, and public.notes never gets a user_id — which
 * is why History / Analytics / Graph would otherwise show empty.
 *
 * Requires NEXT_PUBLIC_CHROME_EXTENSION_ID. Optional NEXT_PUBLIC_INLINE_BACKEND_URL
 * overrides the annotation API origin (defaults to the site origin in production).
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSiteUrl, resolveExtensionBackendBase } from '@/lib/inline-origin'

type ChromeLike = {
  runtime?: {
    sendMessage: (extensionId: string, message: unknown, responseCallback?: () => void) => void
  }
}

import { resolveWorkspaceIdFromBrowserPath } from '@/lib/workspace-routes'

function sendToExtension(
  extId: string,
  payload: {
    accessToken: string
    userId: string
    workspaceId: string
    apiBase: string
    backendBase: string
  },
) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { chrome?: ChromeLike }
  try {
    w.chrome?.runtime?.sendMessage(extId, { type: 'INLINE_SYNC_AUTH', payload }, () => {
      /* ignore lastError — extension may not be installed */
    })
  } catch {
    /* not Chrome or extension missing */
  }
}

export default function ExtensionAuthSync() {
  const pathname = usePathname()

  useEffect(() => {
    const extId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID
    if (!extId) return

    const apiBase =
      (typeof window !== 'undefined' ? window.location.origin : '') ||
      getSiteUrl()
    const backendBase = resolveExtensionBackendBase()

    const supabase = createClient()

    const push = (session: { access_token?: string; user?: { id?: string } } | null) => {
      const workspaceId = resolveWorkspaceIdFromBrowserPath(pathname)
      sendToExtension(extId, {
        accessToken: session?.access_token ?? '',
        userId:      session?.user?.id ?? '',
        workspaceId,
        apiBase,
        backendBase,
      })
    }

    void supabase.auth.getSession().then(({ data }) => push(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => push(session))

    return () => { sub.subscription.unsubscribe() }
  }, [pathname])

  return null
}
