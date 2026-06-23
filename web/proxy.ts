import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

import { DEFAULT_WORKSPACES } from '@/lib/workspaces'
import { workspacePath } from '@/lib/workspace-routes'

const DEFAULT_WORKSPACE_ROUTE = workspacePath(DEFAULT_WORKSPACES[0]!, 'dashboard')

function redirectLegacyFlatDocUrl(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const m = pathname.match(/^\/app\/([^/]+)\/(doc-\d+[^/]*)$/i)
  if (!m) return null
  const url = request.nextUrl.clone()
  url.pathname = `/app/${m[1]}/doc/${m[2]}`
  return NextResponse.redirect(url)
}

function redirectFolderSegmentIsDocId(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const m = pathname.match(/^\/app\/([^/]+)\/folder\/(doc-\d+[^/]*)$/i)
  if (!m) return null
  const url = request.nextUrl.clone()
  url.pathname = `/app/${m[1]}/doc/${m[2]}`
  return NextResponse.redirect(url)
}

function redirectRootDocId(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const m = pathname.match(/^\/(doc-\d+[^/]*)$/i)
  if (!m) return null
  const url = request.nextUrl.clone()
  url.pathname = `${DEFAULT_WORKSPACE_ROUTE.replace(/\/dashboard$/, '')}/doc/${m[1]}`
  return NextResponse.redirect(url)
}

/** Nested folder/doc URLs can 404 in dev — serve the flat doc route instead. */
function rewriteNestedFolderDocUrl(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const m = pathname.match(/^\/app\/([^/]+)\/folder\/[^/]+\/doc\/([^/]+)$/)
  if (!m) return null
  const url = request.nextUrl.clone()
  url.pathname = `/app/${m[1]}/doc/${m[2]}`
  return NextResponse.rewrite(url)
}

function redirectLegacyWorkspaceIdUrl(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const m = pathname.match(/^\/app\/(ws-\d+)(\/.*)?$/)
  if (!m) return null
  const ws = DEFAULT_WORKSPACES.find(w => w.id === m[1])
  if (!ws) return null
  const url = request.nextUrl.clone()
  const tail = m[2] || '/dashboard'
  url.pathname = workspacePath(ws) + tail
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const legacyWs = redirectLegacyWorkspaceIdUrl(request)
  if (legacyWs) return legacyWs

  const nestedDoc = rewriteNestedFolderDocUrl(request)
  if (nestedDoc) return nestedDoc

  const fixed =
    redirectFolderSegmentIsDocId(request) ??
    redirectLegacyFlatDocUrl(request) ??
    redirectRootDocId(request)
  if (fixed) return fixed

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next()
  }

  try {
    return await updateSession(request)
  } catch (err) {
    console.error('[proxy] updateSession error:', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
