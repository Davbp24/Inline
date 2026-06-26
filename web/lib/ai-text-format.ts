/**
 * Parse and normalize AI-produced text for display.
 * Markdown-like markers (**bold**, *italic*, bullets) render as styled UI — never as literal asterisks.
 */

export const AI_KIND_LABELS: Record<string, string> = {
  'ai-rephrase': 'Rephrase',
  'ai-shorten': 'Shorten',
  'ai-summarize': 'Summarize',
  'ai-rewrite': 'Rewrite',
  'ai-custom': 'Custom',
  rephrase: 'Rephrase',
  shorten: 'Shorten',
  summary: 'Summary',
  summarize: 'Summary',
  rewrite: 'Rewrite',
  custom: 'Custom',
  ai: 'AI',
}

export function formatAiKindLabel(kind: string): string {
  const lower = kind.toLowerCase()
  if (AI_KIND_LABELS[lower]) return AI_KIND_LABELS[lower]!
  const stripped = lower.replace(/^ai-/, '')
  if (AI_KIND_LABELS[stripped]) return AI_KIND_LABELS[stripped]!
  return stripped.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Strip markdown markers for table previews and search snippets. */
export function stripMarkdownToPlainText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export type InlineSegment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'underline'; value: string }
  | { type: 'code'; value: string }

const INLINE_TOKEN_RE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g

export function parseInlineFormatting(text: string): InlineSegment[] {
  if (!text) return []
  const parts = text.split(INLINE_TOKEN_RE)
  const segments: InlineSegment[] = []

  for (const part of parts) {
    if (!part) continue
    const bold = /^\*\*([^*]+)\*\*$/.exec(part)
    if (bold) {
      segments.push({ type: 'bold', value: bold[1]! })
      continue
    }
    const underline = /^__([^_]+)__$/.exec(part)
    if (underline) {
      segments.push({ type: 'underline', value: underline[1]! })
      continue
    }
    const italicStar = /^\*([^*]+)\*$/.exec(part)
    if (italicStar) {
      segments.push({ type: 'italic', value: italicStar[1]! })
      continue
    }
    const italicUnderscore = /^_([^_]+)_$/.exec(part)
    if (italicUnderscore) {
      segments.push({ type: 'italic', value: italicUnderscore[1]! })
      continue
    }
    const code = /^`([^`]+)`$/.exec(part)
    if (code) {
      segments.push({ type: 'code', value: code[1]! })
      continue
    }
    segments.push({ type: 'text', value: part })
  }

  return segments
}

export type AiTextBlock =
  | { type: 'paragraph'; inline: InlineSegment[] }
  | { type: 'bullet-list'; items: InlineSegment[][] }
  | { type: 'numbered-list'; items: InlineSegment[][] }
  | { type: 'blockquote'; inline: InlineSegment[] }

const BULLET_LINE = /^[-*•]\s+/
const NUMBER_LINE = /^\d+[.)]\s+/

export function parseAiTextBlocks(text: string): AiTextBlock[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const blocks = normalized.split(/\n\n+/)
  const result: AiTextBlock[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean)
    const bulletLines = lines.filter(l => BULLET_LINE.test(l))
    const numberedLines = lines.filter(l => NUMBER_LINE.test(l))
    const proseLines = lines.filter(l => !BULLET_LINE.test(l) && !NUMBER_LINE.test(l))

    if (bulletLines.length > 0) {
      if (proseLines.length > 0) {
        result.push({ type: 'paragraph', inline: parseInlineFormatting(proseLines.join(' ')) })
      }
      result.push({
        type: 'bullet-list',
        items: bulletLines.map(l => parseInlineFormatting(l.replace(BULLET_LINE, ''))),
      })
      continue
    }

    if (numberedLines.length > 0 && proseLines.length === 0) {
      result.push({
        type: 'numbered-list',
        items: numberedLines.map(l => parseInlineFormatting(l.replace(NUMBER_LINE, ''))),
      })
      continue
    }

    if (lines.every(l => l.startsWith('>'))) {
      result.push({
        type: 'blockquote',
        inline: parseInlineFormatting(lines.map(l => l.replace(/^>\s?/, '')).join(' ')),
      })
      continue
    }

    result.push({
      type: 'paragraph',
      inline: parseInlineFormatting(trimmed.replace(/\n/g, ' ')),
    })
  }

  return result
}
