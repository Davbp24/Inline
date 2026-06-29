import type { AnyClient } from '@/lib/ai/agents/types'
import {
  dedupeSources,
  fetchRecentNotes,
  formatSourcesForPrompt,
  MIN_DISPLAY_SIMILARITY,
  retrieveRelevantChunks,
  type RagSource,
} from '@/lib/ai/rag/retrieval'
import { ensureWorkspaceIndexed } from '@/lib/ai/rag/indexer'

/**
 * Memory tool — semantic retrieval over the user's saved captures/documents,
 * reusing the existing RAG pipeline (workspace_embeddings + recency fallback).
 * Returns both citable sources and a ready-to-embed context block for prompts.
 */

export type MemorySearchResult = {
  mode: 'semantic' | 'recency' | 'none'
  sources: RagSource[]
  contextBlock: string
}

export async function searchMemories(
  supabase: AnyClient,
  userId: string,
  workspaceId: string,
  query: string,
  { index = true }: { index?: boolean } = {},
): Promise<MemorySearchResult> {
  if (index && workspaceId) {
    try {
      await ensureWorkspaceIndexed(supabase, userId, workspaceId, { maxBatches: 4, batchSize: 25 })
    } catch {
      /* best-effort indexing — retrieval still runs on whatever exists */
    }
  }

  const retrieval = await retrieveRelevantChunks(supabase, workspaceId, query)

  let chunks = retrieval.chunks
  let usingRecency = false
  if (chunks.length === 0 && retrieval.mode === 'recency') {
    chunks = await fetchRecentNotes(supabase, workspaceId)
    usingRecency = chunks.length > 0
  }

  const mode: MemorySearchResult['mode'] =
    retrieval.mode === 'semantic' && chunks.length > 0
      ? 'semantic'
      : usingRecency
        ? 'recency'
        : chunks.length > 0
          ? 'semantic'
          : 'none'

  if (mode === 'recency') {
    const contextBlock = chunks
      .map((chunk) => {
        const label = chunk.page_title || chunk.domain || chunk.source_type
        return `(recent capture — ${label})\n${chunk.chunk_text.slice(0, 1200)}`
      })
      .join('\n\n')
    return { mode, sources: [], contextBlock }
  }

  const sources = dedupeSources(chunks).filter(
    (s) => s.similarity == null || s.similarity >= MIN_DISPLAY_SIMILARITY,
  )
  return { mode, sources, contextBlock: formatSourcesForPrompt(chunks, sources) }
}
