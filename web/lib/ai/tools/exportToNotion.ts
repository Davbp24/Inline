import type { AnyClient } from '@/lib/ai/agents/types'
import {
  exportToNotionDatabase,
  getNotionConnection,
  type NotionExport,
} from '@/lib/integrations/notion'

/**
 * Export tool — pushes a record into the user's connected Notion database.
 * Resolves the stored connection first; returns a clear "not connected" result
 * instead of throwing so the Action agent can report it cleanly.
 */
export async function exportToNotion(
  supabase: AnyClient,
  userId: string,
  workspaceId: string,
  payload: NotionExport,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const connection = await getNotionConnection(supabase, userId, workspaceId)
  if (!connection) {
    return { ok: false, error: 'Notion is not connected. Connect it in workspace settings first.' }
  }
  if (!connection.databaseId) {
    return { ok: false, error: 'No Notion database is configured for this connection.' }
  }
  return exportToNotionDatabase(connection.token, connection.databaseId, payload)
}
