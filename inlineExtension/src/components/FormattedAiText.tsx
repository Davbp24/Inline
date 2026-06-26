import type { CSSProperties, ReactNode } from 'react'
import { PANEL as C } from '../lib/extensionTheme'
import {
  parseAiTextBlocks,
  type InlineSegment,
} from '../lib/aiTextFormat'

function InlineFormatted({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'bold':
            return <strong key={i} style={{ fontWeight: 600 }}>{seg.value}</strong>
          case 'italic':
            return <em key={i}>{seg.value}</em>
          case 'underline':
            return <u key={i}>{seg.value}</u>
          case 'code':
            return (
              <code
                key={i}
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.85em',
                  background: C.surfaceMuted,
                  borderRadius: 4,
                  padding: '0 4px',
                }}
              >
                {seg.value}
              </code>
            )
          default:
            return <span key={i}>{seg.value}</span>
        }
      })}
    </>
  )
}

interface FormattedAiTextProps {
  text: string
  style?: CSSProperties
}

/** Renders AI output with bullets, bold, italic, underline — no literal asterisks. */
export default function FormattedAiText({ text, style }: FormattedAiTextProps) {
  const base: CSSProperties = {
    fontSize: 14,
    lineHeight: 1.625,
    color: C.text,
    ...style,
  }

  const blocks = parseAiTextBlocks(text)
  if (blocks.length === 0) return null

  return (
    <div style={base}>
      {blocks.map((block, blockIdx) => {
        const blockGap = blockIdx < blocks.length - 1 ? 12 : 0
        let node: ReactNode

        switch (block.type) {
          case 'bullet-list':
            node = (
              <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    style={{ marginBottom: j < block.items.length - 1 ? 6 : 0, paddingLeft: 2 }}
                  >
                    <InlineFormatted segments={item} />
                  </li>
                ))}
              </ul>
            )
            break
          case 'numbered-list':
            node = (
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    style={{ marginBottom: j < block.items.length - 1 ? 6 : 0, paddingLeft: 2 }}
                  >
                    <InlineFormatted segments={item} />
                  </li>
                ))}
              </ol>
            )
            break
          case 'blockquote':
            node = (
              <blockquote
                style={{
                  margin: 0,
                  borderLeft: `2px solid ${C.border}`,
                  paddingLeft: 12,
                  color: C.textMuted,
                }}
              >
                <InlineFormatted segments={block.inline} />
              </blockquote>
            )
            break
          default:
            node = (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                <InlineFormatted segments={block.inline} />
              </p>
            )
        }

        return (
          <div key={blockIdx} style={{ marginBottom: blockGap }}>
            {node}
          </div>
        )
      })}
    </div>
  )
}
