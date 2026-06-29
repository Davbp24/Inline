import { NextResponse } from 'next/server'
import { getSupabaseAndUserFromRequest } from '@/lib/ai-key'
import { testNotion } from '@/lib/integrations/notion'

/**
 * Notion connection management.
 *   GET    ?workspaceId= -> connection status (never returns the token)
 *   POST   { workspaceId, token, databaseId } -> validate + save
 *   DELETE ?workspaceId= -> disconnect
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: Request) {
  const { user, supabase } = await getSupabaseAndUserFromRequest(request)
  if (!user || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = new URL(request.url).searchParams.get('workspaceId') ?? ''

  const { data } = await (supabase.from('integration_connections') as any)
    .select('config, status, updated_at, workspace_id')
    .eq('user_id', user.id)
    .eq('provider', 'notion')
    .order('updated_at', { ascending: false })

  const rows = (data ?? []) as Array<{ config: any; status: string; workspace_id: string }>
  const match = rows.find((r) => r.workspace_id === workspaceId) ?? rows[0]

  if (!match) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected: match.status === 'connected',
    databaseId: match.config?.databaseId ?? null,
    workspaceName: match.config?.workspaceName ?? null,
  })
}

export async function POST(request: Request) {
  const { user, supabase } = await getSupabaseAndUserFromRequest(request)
  if (!user || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const databaseId = typeof body.databaseId === 'string' ? body.databaseId.trim() : ''
  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : ''

  if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 })

  const test = await testNotion(token, databaseId || null)
  if (!test.ok) {
    return NextResponse.json({ error: test.error ?? 'Notion connection failed' }, { status: 400 })
  }

  const { error } = await (supabase.from('integration_connections') as any).upsert(
    {
      user_id: user.id,
      workspace_id: workspaceId,
      provider: 'notion',
      access_token: token,
      config: { databaseId: databaseId || null, workspaceName: test.workspaceName ?? null },
      status: 'connected',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,workspace_id,provider' },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    connected: true,
    databaseId: databaseId || null,
    workspaceName: test.workspaceName ?? null,
  })
}

export async function DELETE(request: Request) {
  const { user, supabase } = await getSupabaseAndUserFromRequest(request)
  if (!user || !supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = new URL(request.url).searchParams.get('workspaceId') ?? ''

  const { error } = await (supabase.from('integration_connections') as any)
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'notion')
    .eq('workspace_id', workspaceId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ connected: false })
}
/* eslint-enable @typescript-eslint/no-explicit-any */
