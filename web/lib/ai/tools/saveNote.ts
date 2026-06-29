import type { AnyClient } from '@/lib/ai/agents/types'
import { indexNoteById } from '@/lib/ai/rag/indexer'

/**
 * Save tool — writes a note into public.notes (the dashboard/history spine) and
 * indexes it for RAG, mirroring the /api/clip write path so agent-saved content
 * behaves identically to extension clips. State-changing: only the Action agent
 * (with confirmation) should call this.
 */

export type SaveNoteInput = {
  pageUrl?: string | null
  pageTitle?: string | null
  content: string
  type?: string
  tags?: string[]
  color?: string
  workspaceId?: string | null
}

export type SaveNoteResult = { ok: boolean; noteId?: string; error?: string }

const ALLOWED_TYPES = new Set(['text', 'canvas', 'ai-summary'])

export async function saveNote(
  supabase: AnyClient,
  userId: string,
  input: SaveNoteInput,
  { index = true }: { index?: boolean } = {},
): Promise<SaveNoteResult> {
  const content = String(input.content ?? '').slice(0, 20_000)
  if (!content.trim()) return { ok: false, error: 'content is required' }

  let domain = ''
  if (input.pageUrl) {
    try { domain = new URL(input.pageUrl).hostname } catch { /* not a URL */ }
  }

  // notes.type is constrained to text|canvas|ai-summary; preserve richer kinds
  // in tags (same mapping as /api/clip).
  const requestedType = (input.type || 'text').trim()
  const finalType = ALLOWED_TYPES.has(requestedType)
    ? requestedType
    : requestedType.startsWith('ai-')
      ? 'ai-summary'
      : 'text'
  const baseTags = input.tags && input.tags.length ? input.tags : ['agent']
  const finalTags =
    finalType === requestedType ? baseTags : Array.from(new Set([...baseTags, requestedType]))

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { data, error } = await (supabase.from('notes') as any)
    .insert({
      user_id: userId,
      workspace_id: input.workspaceId ?? null,
      page_url: input.pageUrl || '',
      page_title: input.pageTitle || '',
      content,
      type: finalType,
      domain,
      color: input.color || '#FFEB3B',
      tags: finalTags,
    })
    .select('id')
    .single()
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'insert failed' }
  }

  const noteId: string = data.id
  if (index) {
    try {
      await indexNoteById(supabase, userId, noteId)
    } catch {
      /* indexing is best-effort — the note is already saved */
    }
  }

  return { ok: true, noteId }
}
