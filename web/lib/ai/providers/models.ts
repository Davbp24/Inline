/**
 * Logical model configuration for the multi-provider LLM layer.
 *
 * Agents ask for a *role* ("fast" for routing/transforms, "smart" for
 * reasoning/synthesis) and the provider layer maps that to a concrete model
 * id for whichever provider is active. Gemini stays the default so existing
 * behavior is unchanged unless AI_PROVIDER (or a per-call override) is set.
 *
 * Every id is env-overridable so the deploy can swap models without a code
 * change.
 */

export type ModelProvider = 'google' | 'openai' | 'anthropic'
export type ModelRole = 'fast' | 'smart'

export const ALL_PROVIDERS: ModelProvider[] = ['google', 'openai', 'anthropic']

/** Active provider. Defaults to Gemini to preserve current behavior. */
export const DEFAULT_PROVIDER: ModelProvider =
  (process.env.AI_PROVIDER as ModelProvider | undefined) ?? 'google'

/** Per-provider model id for each logical role. All env-overridable. */
const ROLE_MODELS: Record<ModelProvider, Record<ModelRole, string>> = {
  google: {
    fast: process.env.AI_MODEL_GOOGLE_FAST ?? 'gemini-2.5-flash',
    smart: process.env.AI_MODEL_GOOGLE_SMART ?? 'gemini-2.5-flash',
  },
  openai: {
    fast: process.env.AI_MODEL_OPENAI_FAST ?? 'gpt-4o-mini',
    smart: process.env.AI_MODEL_OPENAI_SMART ?? 'gpt-4o',
  },
  anthropic: {
    fast: process.env.AI_MODEL_ANTHROPIC_FAST ?? 'claude-3-5-haiku-latest',
    smart: process.env.AI_MODEL_ANTHROPIC_SMART ?? 'claude-3-5-sonnet-latest',
  },
}

export function modelIdFor(provider: ModelProvider, role: ModelRole): string {
  return ROLE_MODELS[provider][role]
}

/**
 * Embeddings are a separate concern handled by lib/ai/rag/embeddings.ts
 * (Gemini gemini-embedding-001 @ 768 dims, matched to the pgvector column).
 * Exposed here only so the embedding model has a single documented home.
 */
export const EMBEDDING_PROVIDER: ModelProvider = 'google'
export const EMBEDDING_MODEL_ID = 'gemini-embedding-001'
