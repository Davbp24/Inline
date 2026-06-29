import { saveNote } from '@/lib/ai/tools/saveNote'
import { exportToNotion } from '@/lib/ai/tools/exportToNotion'
import type { Agent, AgentAction } from './types'

/**
 * Action agent — the only agent that changes user state (save, tag, export).
 * It is deliberately gated: without `confirm: true` it returns a
 * `needs_confirmation` action and performs nothing. The set of allowed actions
 * is a fixed switch — agents never run arbitrary mutations.
 */

type ActionName = 'save_note' | 'export_notion'

function resolveAction(params: Record<string, unknown> | undefined, intent?: string): ActionName {
  const raw = String(params?.action ?? '').trim()
  if (raw === 'save_note' || raw === 'export_notion') return raw
  // save_memory intent defaults to saving a note
  return intent === 'save_memory' ? 'save_note' : 'save_note'
}

export const actionAgent: Agent = {
  name: 'action',

  async run(ctx) {
    const action = resolveAction(ctx.params, ctx.intent)

    if (!ctx.confirm) {
      return {
        agent: this.name,
        text: 'This will change your saved data. Re-run with confirmation to proceed.',
        actions: [{ type: action, status: 'needs_confirmation' }],
        usage: [],
      }
    }

    if (action === 'save_note') {
      const content = String(
        ctx.params?.content ?? ctx.selectedText ?? ctx.pageContent ?? '',
      ).trim()

      if (!content) {
        return {
          agent: this.name,
          text: 'There was nothing to save (no selection or content provided).',
          actions: [{ type: 'save_note', status: 'skipped' }],
          usage: [],
        }
      }

      const tags = Array.isArray(ctx.params?.tags)
        ? (ctx.params!.tags as string[])
        : ['agent']

      const res = await saveNote(ctx.supabase, ctx.userId, {
        pageUrl: ctx.pageUrl ?? null,
        pageTitle: ctx.pageTitle ?? null,
        content,
        type: String(ctx.params?.type ?? 'text'),
        tags,
        workspaceId: ctx.workspaceId || null,
      })

      const act: AgentAction = res.ok
        ? { type: 'save_note', status: 'completed', detail: 'Saved to your captures.', data: { noteId: res.noteId } }
        : { type: 'save_note', status: 'failed', detail: res.error }

      return {
        agent: this.name,
        text: res.ok ? 'Saved to your captures.' : `Could not save: ${res.error}`,
        actions: [act],
        usage: [],
      }
    }

    if (action === 'export_notion') {
      const title = String(ctx.params?.title ?? ctx.pageTitle ?? 'Inline capture').slice(0, 200)
      const contentMarkdown = String(
        ctx.params?.content ?? ctx.selectedText ?? ctx.pageContent ?? '',
      ).trim()
      const properties =
        ctx.params?.properties && typeof ctx.params.properties === 'object'
          ? (ctx.params.properties as Record<string, string | string[]>)
          : undefined

      const res = await exportToNotion(ctx.supabase, ctx.userId, ctx.workspaceId, {
        title,
        contentMarkdown,
        properties: { ...properties, ...(ctx.pageUrl ? { URL: ctx.pageUrl } : {}) },
      })

      const act: AgentAction = res.ok
        ? { type: 'export_notion', status: 'completed', detail: 'Exported to Notion.', data: { url: res.url } }
        : { type: 'export_notion', status: 'failed', detail: res.error }

      return {
        agent: this.name,
        text: res.ok ? `Exported to Notion${res.url ? `: ${res.url}` : '.'}` : `Could not export: ${res.error}`,
        actions: [act],
        usage: [],
      }
    }

    return {
      agent: this.name,
      text: 'That action is not available yet.',
      actions: [{ type: action, status: 'skipped' }],
      usage: [],
    }
  },
}
