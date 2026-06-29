import { getCurrentPage } from '@/lib/ai/tools/getCurrentPage'
import { runModel } from './runtime'
import type { Agent } from './types'

/**
 * Research agent — reads the current page (or selection) and summarizes or
 * extracts information from it. Handles both the "summarize" and "research"
 * intents; the intent tunes the instruction.
 */
export const researchAgent: Agent = {
  name: 'research',

  async run(ctx) {
    const page = getCurrentPage(ctx)
    const material = page.selectedText || page.content

    if (!material.trim()) {
      return {
        agent: this.name,
        text: "I don't have any page content to work with. Open a page (or select text) and try again.",
        usage: [],
      }
    }

    const instruction =
      ctx.intent === 'summarize'
        ? 'Summarize the material below: one short overview paragraph, then 3-5 key bullet points starting with "- ".'
        : "Read the material below and answer the user's request. Pull out concrete facts (names, numbers, requirements, dates) when relevant. Use short paragraphs and \"- \" bullets."

    const prompt = `${instruction}

User request: ${ctx.userPrompt}
${page.title ? `Page title: ${page.title}\n` : ''}${page.url ? `URL: ${page.url}\n` : ''}
Material:
${material}`

    const { text, usage } = await runModel({
      agent: this.name,
      role: 'smart',
      prompt,
      maxOutputTokens: 700,
    })

    return { agent: this.name, text, usage: [usage] }
  },
}
