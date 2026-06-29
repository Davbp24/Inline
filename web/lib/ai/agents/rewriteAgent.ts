import { runModel } from './runtime'
import type { Agent } from './types'

/**
 * Rewrite agent — transforms selected/provided text per an instruction while
 * preserving meaning. Mirrors the existing /api/ai/extension-light behavior as
 * a focused agent.
 */
export const rewriteAgent: Agent = {
  name: 'rewrite',

  async run(ctx) {
    const source = (ctx.selectedText?.trim() || String(ctx.params?.text ?? '').trim())
    if (!source) {
      return {
        agent: this.name,
        text: 'Select the text you want me to rewrite (or pass it in), then try again.',
        usage: [],
      }
    }

    const instruction = String(
      ctx.params?.instruction ?? ctx.userPrompt ?? 'Rewrite clearly, keeping the same meaning.',
    ).trim()

    const prompt = `Rewrite the following text. Instruction: ${instruction}

Return ONLY the rewritten text, with no preamble or quotes.

Text:
${source}`

    const { text, usage } = await runModel({
      agent: this.name,
      role: 'fast',
      prompt: prompt.slice(0, 12_000),
      maxOutputTokens: 700,
    })

    return { agent: this.name, text, usage: [usage], data: { original: source } }
  },
}
