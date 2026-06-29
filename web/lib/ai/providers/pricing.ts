/**
 * Rough token pricing (USD per 1M tokens) for the usage/ROI dashboard. These
 * are estimates for display only, env-overridable via AI_PRICE_<MODEL> is not
 * needed — keep them approximate and clearly labeled as estimates in the UI.
 */

type Price = { in: number; out: number }

const PRICES: Record<string, Price> = {
  'gemini-2.5-flash': { in: 0.3, out: 2.5 },
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-4o': { in: 2.5, out: 10 },
  'claude-3-5-haiku-latest': { in: 0.8, out: 4 },
  'claude-3-5-sonnet-latest': { in: 3, out: 15 },
}

const DEFAULT_PRICE: Price = { in: 0.3, out: 2.5 }

export function estimateCostUsd(modelId: string, inputTokens: number, outputTokens: number): number {
  const price = PRICES[modelId] ?? DEFAULT_PRICE
  return (inputTokens / 1_000_000) * price.in + (outputTokens / 1_000_000) * price.out
}
