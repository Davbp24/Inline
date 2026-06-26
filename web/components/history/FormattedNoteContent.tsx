'use client'

import FormattedAiText from '@/components/ui/formatted-ai-text'
import { prettyNotePreview } from '@/lib/note-preview'
import type { Note } from '@/lib/types'
import { stripHtml } from '@/lib/utils'

export function FormattedNoteContent({
  note,
}: {
  note: Pick<Note, 'content' | 'type' | 'tags' | 'domain'>
}) {
  if (note.type === 'ai-summary') {
    return <FormattedAiText text={stripHtml(note.content ?? '')} />
  }
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {prettyNotePreview(note) || '(no content)'}
    </p>
  )
}

export function FormattedAiOutput({ text }: { text: string }) {
  return <FormattedAiText text={text} />
}
