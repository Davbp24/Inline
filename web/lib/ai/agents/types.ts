import type { SupabaseClient } from '@supabase/supabase-js'
import type { RagSource } from '@/lib/ai/rag/retrieval'

/**
 * Shared contracts for the Inline agent layer. Agents are small, single-purpose
 * units (research, memory, rewrite, action, fit, evaluator) coordinated by the
 * router. They share one context object and return a uniform result so the
 * orchestrator can run, evaluate, persist, and surface them consistently.
 */

export type AgentIntent =
  | 'rewrite'
  | 'summarize'
  | 'research'
  | 'ask_context'
  | 'save_memory'
  | 'career_fit'
  | 'action'

export const AGENT_INTENTS: AgentIntent[] = [
  'rewrite',
  'summarize',
  'research',
  'ask_context',
  'save_memory',
  'career_fit',
  'action',
]

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Loosely-typed Supabase client (matches the RAG library's usage). */
export type AnyClient = SupabaseClient<any, any, any>
/* eslint-enable @typescript-eslint/no-explicit-any */

export type AgentContext = {
  /** The user's natural-language request. */
  userPrompt: string
  /** Highlighted text on the page, if any. */
  selectedText?: string
  pageUrl?: string
  pageTitle?: string
  /** Visible page text (passed from the extension / caller). */
  pageContent?: string
  /** Free-text workspace id (matches existing 'ws-1' / 'dashboard' convention). */
  workspaceId: string
  userId: string
  /** RLS-scoped Supabase client for the calling user. */
  supabase: AnyClient
  /** Pre-resolved intent; when absent the router classifies it. */
  intent?: AgentIntent
  /** Gate for state-changing actions — the Action agent refuses without it. */
  confirm?: boolean
  /** Extra structured params (rewrite instruction, action name, etc.). */
  params?: Record<string, unknown>
}

/** One model call's measured cost, captured for the usage/ROI dashboard. */
export type AgentUsage = {
  agent: string
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  latencyMs: number
}

/** A state change an agent performed or proposed. */
export type AgentAction = {
  type: string
  status: 'completed' | 'skipped' | 'needs_confirmation' | 'failed'
  detail?: string
  data?: Record<string, unknown>
}

export type AgentResult = {
  agent: string
  text: string
  sources?: RagSource[]
  actions?: AgentAction[]
  usage?: AgentUsage[]
  /** Arbitrary structured output (e.g. extracted role fields, fit score). */
  data?: Record<string, unknown>
}

export interface Agent {
  /** Stable identifier used in logs, metrics, and the agents_used array. */
  readonly name: string
  run(ctx: AgentContext): Promise<AgentResult>
}
