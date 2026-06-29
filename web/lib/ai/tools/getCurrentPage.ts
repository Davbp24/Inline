import type { AgentContext } from '@/lib/ai/agents/types'

/**
 * Current-page tool — normalizes the page context the caller passed in
 * (extension content script or dashboard) into a consistent, length-capped
 * shape for agents that read the page the user is looking at.
 */

export type CurrentPage = {
  url: string | null
  title: string | null
  domain: string | null
  content: string
  selectedText: string
  hasContent: boolean
}

const MAX_PAGE_CHARS = 16_000

export function getCurrentPage(ctx: AgentContext): CurrentPage {
  let domain: string | null = null
  if (ctx.pageUrl) {
    try { domain = new URL(ctx.pageUrl).hostname } catch { /* not a URL */ }
  }

  const content = (ctx.pageContent ?? '').slice(0, MAX_PAGE_CHARS)
  const selectedText = (ctx.selectedText ?? '').slice(0, MAX_PAGE_CHARS)

  return {
    url: ctx.pageUrl ?? null,
    title: ctx.pageTitle ?? null,
    domain,
    content,
    selectedText,
    hasContent: Boolean(content.trim() || selectedText.trim()),
  }
}
