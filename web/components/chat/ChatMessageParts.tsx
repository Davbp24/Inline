'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { CHAT_THINKING_MESSAGE, prepareAssistantTextForDisplay } from '@/lib/chat-format'
import FormattedAiText from '@/components/ui/formatted-ai-text'

export function AssistantMessageContent({
  content,
  thinking,
  error,
}: {
  content: string
  thinking?: boolean
  error?: boolean
}) {
  if (thinking && !content.trim()) {
    return (
      <p className="text-sm italic text-muted-foreground" role="status">
        {CHAT_THINKING_MESSAGE}
      </p>
    )
  }

  if (!content.trim()) return null

  return (
    <FormattedAiText
      text={prepareAssistantTextForDisplay(content)}
      error={error}
    />
  )
}

export function UserMessageBubble({
  content,
  variant = 'default',
}: {
  content: string
  variant?: 'default' | 'sidePanel'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [multiline, setMultiline] = useState(() => /\n/.test(content))

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      if (/\n/.test(content)) {
        setMultiline(true)
        return
      }
      const style = window.getComputedStyle(el)
      const lineHeight = parseFloat(style.lineHeight) || 20
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      setMultiline(el.scrollHeight > lineHeight + paddingY + 2)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [content])

  return (
    <div
      ref={ref}
      className={cn(
        'ml-auto inline-block max-w-[82%] px-4 py-2.5 text-sm leading-relaxed wrap-anywhere',
        variant === 'sidePanel'
          ? 'max-w-[88%] rounded-2xl bg-muted text-foreground'
          : cn(
              'bg-primary text-primary-foreground',
              multiline ? 'rounded-2xl' : 'rounded-full',
            ),
      )}
    >
      {content}
    </div>
  )
}
