import type { LanguageModel } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { getProviderApiKey } from '@/lib/ai-key'
import {
  DEFAULT_PROVIDER,
  modelIdFor,
  type ModelProvider,
  type ModelRole,
} from './models'

/**
 * Provider-agnostic model resolution.
 *
 * `resolveModel` returns a ready Vercel AI SDK language model plus the
 * provider/model id that was actually used (for usage logging). It tries the
 * requested provider, then the configured default, then Google — so a missing
 * OpenAI/Anthropic key transparently falls back to Gemini and nothing breaks.
 */

export type ResolveModelOptions = {
  /** "fast" for routing/transforms, "smart" for reasoning. Defaults to fast. */
  role?: ModelRole
  /** Force a specific provider for this call (otherwise uses DEFAULT_PROVIDER). */
  provider?: ModelProvider
}

export type ResolvedModel = {
  model: LanguageModel
  provider: ModelProvider
  modelId: string
}

function instantiate(
  provider: ModelProvider,
  apiKey: string,
  modelId: string,
): LanguageModel {
  switch (provider) {
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelId)
    case 'openai':
      return createOpenAI({ apiKey })(modelId)
    case 'anthropic':
      return createAnthropic({ apiKey })(modelId)
  }
}

/** Ordered, de-duplicated provider preference for a call. */
function providerOrder(requested?: ModelProvider): ModelProvider[] {
  const order: ModelProvider[] = []
  for (const p of [requested, DEFAULT_PROVIDER, 'google' as const]) {
    if (p && !order.includes(p)) order.push(p)
  }
  return order
}

/**
 * Resolve a model for the given role, falling back across providers until one
 * has a configured API key. Returns null only when no provider key exists.
 */
export async function resolveModel(
  opts: ResolveModelOptions = {},
): Promise<ResolvedModel | null> {
  const role: ModelRole = opts.role ?? 'fast'
  for (const provider of providerOrder(opts.provider)) {
    const apiKey = await getProviderApiKey(provider)
    if (!apiKey) continue
    const modelId = modelIdFor(provider, role)
    return { model: instantiate(provider, apiKey, modelId), provider, modelId }
  }
  return null
}

/** Convenience accessor when you only need the model (throws if none configured). */
export async function getModel(opts: ResolveModelOptions = {}): Promise<LanguageModel> {
  const resolved = await resolveModel(opts)
  if (!resolved) throw new Error('No AI provider API key configured.')
  return resolved.model
}

export type { ModelProvider, ModelRole }
