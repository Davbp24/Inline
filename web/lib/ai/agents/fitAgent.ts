import { getCurrentPage } from '@/lib/ai/tools/getCurrentPage'
import { searchMemories } from '@/lib/ai/tools/searchMemories'
import { INLINE_SHORT_PERSONA } from '@/lib/inline-persona'
import { runModel, parseJsonFromModel } from './runtime'
import type { Agent, AgentUsage } from './types'

/**
 * Fit agent — the flagship composite workflow. It chains three steps:
 *   1. Research: extract structured role requirements from the current page.
 *   2. Memory: retrieve the user's saved background (resume, projects, notes).
 *   3. Compare: produce a grounded fit assessment + tailored suggestions.
 * It aggregates usage from every sub-step so the ROI dashboard sees the true
 * cost of the workflow.
 */

type RoleData = {
  title?: string
  company?: string
  deadline?: string
  skills?: string[]
  responsibilities?: string[]
  raw?: string
}

export const fitAgent: Agent = {
  name: 'fit',

  async run(ctx) {
    const usage: AgentUsage[] = []
    const page = getCurrentPage(ctx)
    const material = page.selectedText || page.content

    // ---- Step 1: extract role requirements from the page ------------------
    let role: RoleData = {}
    if (material.trim()) {
      const extract = await runModel({
        agent: 'fit:research',
        role: 'smart',
        prompt: `Extract the job/role details from the material below as JSON with keys: title, company, deadline, skills (string array), responsibilities (string array). Use empty values if unknown. Return ONLY JSON.

Material:
${material}`,
        maxOutputTokens: 500,
        temperature: 0,
      })
      usage.push(extract.usage)
      role = parseJsonFromModel<RoleData>(extract.text) ?? { raw: extract.text }
    }

    // ---- Step 2: retrieve the user's saved background ---------------------
    const roleTitle = role.title || ctx.pageTitle || 'this role'
    const memory = await searchMemories(
      ctx.supabase,
      ctx.userId,
      ctx.workspaceId,
      `my background, skills, experience, projects, and resume relevant to ${roleTitle}`,
    )

    const backgroundBlock =
      memory.mode === 'none'
        ? '(No saved background found. Note this gap in the answer and give general guidance.)'
        : memory.contextBlock

    // ---- Step 3: compare and advise --------------------------------------
    const roleSummary =
      role.raw ??
      `Title: ${role.title ?? 'unknown'}
Company: ${role.company ?? 'unknown'}
Deadline: ${role.deadline ?? 'unknown'}
Skills: ${(role.skills ?? []).join(', ') || 'unknown'}
Responsibilities: ${(role.responsibilities ?? []).join('; ') || 'unknown'}`

    const system = `${INLINE_SHORT_PERSONA}
You are doing a career-fit analysis. Be honest and specific. Ground every claim about the user in their saved background; if something isn't supported, say so. ${memory.mode === 'semantic' ? 'Cite saved background as [n] only when n appears in the numbered sources.' : 'Do not use [n] citations.'}`

    const prompt = `User request: ${ctx.userPrompt}

# Role requirements
${roleSummary}

# The user's saved background
${backgroundBlock}

Write the response as:
- A one-line fit verdict (Strong fit / Partial fit / Weak fit) with a 1-2 sentence reason.
- "Strengths" — 2-4 bullets mapping the user's background to the role.
- "Gaps" — 1-3 bullets on what's missing or unproven.
- "Suggested next step" — one concrete action (e.g. a tailored resume bullet or outreach line).`

    const compare = await runModel({
      agent: 'fit:compare',
      role: 'smart',
      system,
      prompt,
      maxOutputTokens: 900,
    })
    usage.push(compare.usage)

    return {
      agent: this.name,
      text: compare.text,
      sources: memory.sources,
      usage,
      data: { role },
    }
  },
}
