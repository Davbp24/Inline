import { runModel } from './runtime'
import { AGENT_INTENTS, type AgentContext, type AgentIntent, type AgentUsage } from './types'

/**
 * Router agent — decides which specialized agent should handle a request.
 *
 * Order of precedence:
 *   1. An explicit `intent` on the context (callers like the "Analyze role"
 *      button skip classification entirely).
 *   2. A fast LLM classifier (one short label, usage captured).
 *   3. Keyword heuristics, then a safe default — used when no AI key is set
 *      or the model returns something unexpected.
 */

export const ROUTER_SYSTEM = `You are the intent router for Inline, a web research assistant.
Classify the user's request into exactly ONE of these labels:
- rewrite: transform/reword/shorten selected or provided text
- summarize: condense a page or text into key points
- research: read the current page and extract or explain information
- ask_context: answer from the user's previously saved notes/captures
- save_memory: save/clip/remember/tag something
- career_fit: judge whether a job/role fits the user, or tailor a resume/outreach
- action: perform a state-changing action (save, tag, export) on the user's data
Respond with only the label, nothing else.`

// Order matters: retrieval questions ("what did I save…") are checked before
// the save action so they aren't misrouted by the word "save".
const KEYWORD_RULES: Array<{ intent: AgentIntent; test: RegExp }> = [
  { intent: 'career_fit', test: /\b(fit|qualified|match (me|my)|should i apply|resume|cv|cover letter|this (job|role|posting|position))\b/i },
  { intent: 'rewrite', test: /\b(rewrite|reword|rephrase|shorten|make (this|it)|more professional|fix the tone|polish)\b/i },
  { intent: 'summarize', test: /\b(summari[sz]e|tl;?dr|key points|key takeaways|recap|overview of)\b/i },
  { intent: 'ask_context', test: /\b(what did i|did i save|did i clip|remind me|where did i|i saved|i previously)\b/i },
  { intent: 'save_memory', test: /\b(save|remember|clip|bookmark|tag this|add (this|it) to)\b/i },
  { intent: 'research', test: /\b(extract|analy[sz]e|pull out|requirements|what (does|is) this page|explain this)\b/i },
]

function keywordIntent(prompt: string): AgentIntent | null {
  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(prompt)) return rule.intent
  }
  return null
}

function normalizeIntent(raw: string): AgentIntent | null {
  const cleaned = raw.toLowerCase().replace(/[^a-z_]/g, '')
  return (AGENT_INTENTS as string[]).includes(cleaned) ? (cleaned as AgentIntent) : null
}

export type RouteResult = {
  intent: AgentIntent
  source: 'explicit' | 'model' | 'keyword' | 'default'
  usage?: AgentUsage
}

export async function routeIntent(ctx: AgentContext): Promise<RouteResult> {
  if (ctx.intent && (AGENT_INTENTS as string[]).includes(ctx.intent)) {
    return { intent: ctx.intent, source: 'explicit' }
  }

  const hints: string[] = []
  if (ctx.selectedText?.trim()) hints.push('The user has text selected on the page.')
  if (ctx.pageContent?.trim()) hints.push('Page content is available.')

  try {
    const { text, usage } = await runModel({
      agent: 'router',
      role: 'fast',
      system: ROUTER_SYSTEM,
      prompt: `${hints.join(' ')}\n\nRequest: ${ctx.userPrompt}\n\nLabel:`,
      maxOutputTokens: 8,
      temperature: 0,
    })
    const parsed = normalizeIntent(text)
    if (parsed) return { intent: parsed, source: 'model', usage }
  } catch {
    /* fall through to heuristics when no AI key / model error */
  }

  const keyword = keywordIntent(ctx.userPrompt)
  if (keyword) return { intent: keyword, source: 'keyword' }

  return { intent: 'ask_context', source: 'default' }
}
