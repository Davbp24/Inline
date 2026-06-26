'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  parseAiTextBlocks,
  parseInlineFormatting,
  type InlineSegment,
} from '@/lib/ai-text-format'

function InlineFormatted({ segments, className }: { segments: InlineSegment[]; className?: string }) {
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'bold':
            return <strong key={i} className="font-semibold">{seg.value}</strong>
          case 'italic':
            return <em key={i}>{seg.value}</em>
          case 'underline':
            return <u key={i}>{seg.value}</u>
          case 'code':
            return (
              <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                {seg.value}
              </code>
            )
          default:
            return <span key={i}>{seg.value}</span>
        }
      })}
    </span>
  )
}

interface Props {
  text: string
  className?: string
  /** Paragraph / list text size */
  size?: 'sm' | 'base'
  error?: boolean
}

/** Renders AI text with bullets, bold, italic, underline — no literal asterisks. */
export default function FormattedAiText({ text, className, size = 'sm', error }: Props) {
  const blocks = parseAiTextBlocks(text)
  if (blocks.length === 0) return null

  const textClass = size === 'sm' ? 'text-sm leading-relaxed' : 'text-base leading-relaxed'

  return (
    <div className={cn('space-y-3', error && 'text-destructive', className)}>
      {blocks.map((block, i) => {
        let node: ReactNode
        switch (block.type) {
          case 'bullet-list':
            node = (
              <ul className={cn('list-disc space-y-1.5 pl-4', textClass)}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineFormatted segments={item} />
                  </li>
                ))}
              </ul>
            )
            break
          case 'numbered-list':
            node = (
              <ol className={cn('list-decimal space-y-1.5 pl-4', textClass)}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineFormatted segments={item} />
                  </li>
                ))}
              </ol>
            )
            break
          case 'blockquote':
            node = (
              <blockquote className={cn('border-l-2 border-border pl-3 text-muted-foreground', textClass)}>
                <InlineFormatted segments={block.inline} />
              </blockquote>
            )
            break
          default:
            node = (
              <p className={cn(textClass, error ? '' : 'text-foreground')}>
                <InlineFormatted segments={block.inline} />
              </p>
            )
        }
        return <div key={i}>{node}</div>
      })}
    </div>
  )
}

/** Inline-only formatting for single-line previews. */
export function InlineFormattedText({ text, className }: { text: string; className?: string }) {
  return <InlineFormatted segments={parseInlineFormatting(text)} className={className} />
}
