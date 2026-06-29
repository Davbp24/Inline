import { Client } from '@notionhq/client'
import type { AnyClient } from '@/lib/ai/agents/types'

/**
 * Notion integration — manual internal-integration-token model (no OAuth):
 * the user creates a Notion internal integration, shares a database with it,
 * and saves the token + database id. We store those in integration_connections
 * and use them to push structured captures/recaps/role records into Notion.
 */

export type NotionConnection = {
  token: string
  databaseId: string | null
  workspaceName?: string | null
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function createNotionClient(token: string): Client {
  return new Client({ auth: token })
}

/** Validate a token (and optionally that a database is reachable). */
export async function testNotion(
  token: string,
  databaseId?: string | null,
): Promise<{ ok: boolean; error?: string; workspaceName?: string }> {
  try {
    const notion = createNotionClient(token)
    const me: any = await notion.users.me({})
    if (databaseId) {
      await notion.databases.retrieve({ database_id: databaseId })
    }
    return { ok: true, workspaceName: me?.name ?? me?.bot?.workspace_name ?? undefined }
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? 'Notion authentication failed' }
  }
}

/** Read the stored Notion connection for a user/workspace (token included). */
export async function getNotionConnection(
  supabase: AnyClient,
  userId: string,
  workspaceId: string,
): Promise<NotionConnection | null> {
  const { data } = await supabase
    .from('integration_connections')
    .select('access_token, config, workspace_id')
    .eq('user_id', userId)
    .eq('provider', 'notion')
    .order('updated_at', { ascending: false })

  const rows = (data ?? []) as Array<{ access_token: string | null; config: any; workspace_id: string }>
  if (rows.length === 0) return null

  const match = rows.find((r) => r.workspace_id === (workspaceId || '')) ?? rows[0]
  if (!match?.access_token) return null

  return {
    token: match.access_token,
    databaseId: match.config?.databaseId ?? null,
    workspaceName: match.config?.workspaceName ?? null,
  }
}

function paragraphBlocks(markdown: string): any[] {
  return markdown
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 90)
    .map((p) => ({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: p.slice(0, 1900) } }] },
    }))
}

export type NotionExport = {
  title: string
  contentMarkdown?: string
  /** Extra fields mapped onto matching DB properties by name+type. */
  properties?: Record<string, string | string[] | null | undefined>
}

/**
 * Create a page in a Notion database. The title is written to whichever
 * property has type "title" (discovered from the DB schema), and any extra
 * fields are mapped only when a property with that exact name + a supported
 * type exists — so it never fails on a mismatched schema.
 */
export async function exportToNotionDatabase(
  token: string,
  databaseId: string,
  payload: NotionExport,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const notion = createNotionClient(token)
    const db: any = await notion.databases.retrieve({ database_id: databaseId })
    const schema: Record<string, any> = db.properties ?? {}

    const titleKey = Object.keys(schema).find((k) => schema[k]?.type === 'title') ?? 'Name'
    const properties: Record<string, any> = {
      [titleKey]: { title: [{ text: { content: (payload.title || 'Untitled').slice(0, 1900) } }] },
    }

    for (const [key, value] of Object.entries(payload.properties ?? {})) {
      if (value == null) continue
      const prop = schema[key]
      if (!prop) continue
      switch (prop.type) {
        case 'rich_text':
          properties[key] = { rich_text: [{ text: { content: String(value).slice(0, 1900) } }] }
          break
        case 'url':
          properties[key] = { url: String(value) }
          break
        case 'select':
          properties[key] = { select: { name: String(value).slice(0, 90) } }
          break
        case 'multi_select':
          properties[key] = {
            multi_select: (Array.isArray(value) ? value : [value])
              .slice(0, 12)
              .map((v) => ({ name: String(v).slice(0, 90) })),
          }
          break
        case 'date':
          properties[key] = { date: { start: String(value) } }
          break
      }
    }

    const page: any = await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
      ...(payload.contentMarkdown ? { children: paragraphBlocks(payload.contentMarkdown) } : {}),
    })

    return { ok: true, url: page?.url }
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? 'Notion export failed' }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
