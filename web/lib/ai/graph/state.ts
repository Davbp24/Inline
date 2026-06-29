import { Annotation } from '@langchain/langgraph'
import type { AnyClient, AgentAction, AgentIntent, AgentUsage } from '@/lib/ai/agents/types'
import type { RagSource } from '@/lib/ai/rag/retrieval'

/**
 * LangGraph state for the Inline agent workflow.
 *
 * Only serializable data lives here so the in-memory checkpointer can snapshot a
 * run and resume it after a human-in-the-loop interrupt. The non-serializable
 * Supabase client is passed separately through `config.configurable` (see
 * `GraphConfigurable`) and is therefore never written to a checkpoint.
 */

/** Last-write-wins channel with a default, so reads never hit an empty channel. */
function lastValue<T>(def: () => T) {
  return Annotation<T>({ reducer: (_prev: T, next: T) => next, default: def })
}

export const AgentStateAnnotation = Annotation.Root({
  // ---- Inputs (provided at invoke) -------------------------------------
  userPrompt: lastValue<string>(() => ''),
  selectedText: lastValue<string | undefined>(() => undefined),
  pageUrl: lastValue<string | undefined>(() => undefined),
  pageTitle: lastValue<string | undefined>(() => undefined),
  pageContent: lastValue<string | undefined>(() => undefined),
  workspaceId: lastValue<string>(() => ''),
  userId: lastValue<string>(() => ''),
  confirm: lastValue<boolean | undefined>(() => undefined),
  params: lastValue<Record<string, unknown> | undefined>(() => undefined),

  // ---- Routing ---------------------------------------------------------
  intent: lastValue<AgentIntent | undefined>(() => undefined),
  routedBy: lastValue<'explicit' | 'model' | 'keyword' | 'default' | undefined>(() => undefined),

  // ---- Producing-agent output -----------------------------------------
  agentName: lastValue<string | undefined>(() => undefined),
  text: lastValue<string>(() => ''),
  sources: lastValue<RagSource[]>(() => []),
  actions: lastValue<AgentAction[]>(() => []),
  data: lastValue<Record<string, unknown>>(() => ({})),

  // ---- Human-in-the-loop ----------------------------------------------
  approved: lastValue<boolean | undefined>(() => undefined),

  // ---- Evaluation ------------------------------------------------------
  evaluation: lastValue<{ pass: boolean; notes: string } | undefined>(() => undefined),

  // ---- Usage accumulates across every node ----------------------------
  usage: Annotation<AgentUsage[]>({
    reducer: (prev: AgentUsage[], next: AgentUsage[]) => prev.concat(next),
    default: () => [],
  }),
})

export type AgentState = typeof AgentStateAnnotation.State

/** Runtime-only dependencies passed via `config.configurable` (never checkpointed). */
export type GraphConfigurable = {
  /** RLS-scoped Supabase client for the calling user. */
  supabase: AnyClient
  /** Required by the checkpointer to key the run's thread. */
  thread_id: string
}
