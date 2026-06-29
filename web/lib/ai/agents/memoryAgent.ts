import { searchMemories } from '@/lib/ai/tools/searchMemories'
import { INLINE_SYSTEM_CONTEXT } from '@/lib/inline-persona'
import { runModel } from './runtime'
import type { Agent } from './types'

/**
 * Memory agent — answers questions from the user's saved captures/documents
 * using the existing RAG retrieval, with the same strict citation rules as the
 * workspace chat so source cards stay trustworthy.
 */
export const memoryAgent: Agent = {
  name: 'memory',

  async run(ctx) {
    const memory = await searchMemories(ctx.supabase, ctx.userId, ctx.workspaceId, ctx.userPrompt)

    if (memory.mode === 'none') {
      return {
        agent: this.name,
        text: "I couldn't find anything saved for this workspace yet. Capture or clip something first, then ask again.",
        sources: [],
        usage: [],
      }
    }

    const citationRules =
      memory.mode === 'semantic'
        ? 'Cite a source inline as [n] ONLY when n appears in the numbered sources below. Never invent a source number or quote. At most one citation per sentence.'
        : 'The captures below are recent background only — do NOT use [n] citations.'

    const system = `${INLINE_SYSTEM_CONTEXT}

# Citation rules (strict)
${citationRules}`

    const block =
      memory.mode === 'semantic'
        ? `# Retrieved sources\n${memory.contextBlock}`
        : `# Recent captures (background only — do not cite)\n${memory.contextBlock}`

    const { text, usage } = await runModel({
      agent: this.name,
      role: 'smart',
      system,
      prompt: `${ctx.userPrompt}\n\n${block}`,
      maxOutputTokens: 700,
    })

    return { agent: this.name, text, sources: memory.sources, usage: [usage] }
  },
}
