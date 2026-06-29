import type { AnyClient } from '@/lib/ai/agents/types'
import { fetchRecentNotes, type RetrievedChunk } from '@/lib/ai/rag/retrieval'

/**
 * Recent-notes tool — the non-semantic context source used when a question is
 * time-based ("what did I save recently?") or when no embeddings exist yet.
 * Thin wrapper over the RAG library's recency fetch so agents share one path.
 */
export async function getRecentNotes(
  supabase: AnyClient,
  workspaceId: string,
  limit = 12,
): Promise<RetrievedChunk[]> {
  return fetchRecentNotes(supabase, workspaceId, limit)
}
