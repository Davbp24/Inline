'use client'

/**
 * Client-side page-recap engine.
 *
 * For every distinct `page_url` in the workspace's notes, creates (or
 * refreshes) a structured markdown document in the workspace library. The
 * document lives in a synthetic "Auto Recaps" folder so it renders in the
 * same UI as every other workspace document.
 *
 * This runs entirely client-side so it works without the Supabase
 * `public.documents` migration — the recap is stored via `workspace-library`
 * (localStorage). When the migration IS in place you can still opt into the
 * server-backed variant; they coexist.
 */

import type { Note } from './types'
import { stripHtml } from './utils'
import {
  loadFolderDocuments,
  upsertFolderDocument,
  deleteFolderDocument,
  type FolderDocument,
} from './workspace-library'
import { documentHref, isUnsafeDocId, recapDocIdForPageUrl } from './doc-routes'
import {
  loadWorkspaceFolders,
  saveWorkspaceFolders,
  type WorkspaceFolder,
} from './workspace-folders'

const AUTO_RECAP_FOLDER_NAME = 'Auto Recaps'
const RECAP_REGEN_INTERVAL_MS = 5 * 60 * 1000 // re-run at most once every 5 minutes per page

function domainOf(url: string): string {
  try { return new URL(url).hostname } catch { return url.slice(0, 60) }
}

function titleOf(notes: Note[], pageUrl: string): string {
  const withTitle = notes.find(n => n.pageTitle && n.pageTitle.trim())
  return withTitle?.pageTitle?.trim() || domainOf(pageUrl)
}

/** Ensure an "Auto Recaps" folder exists for this workspace. Returns its id. */
export function ensureAutoRecapFolder(workspaceId: string): string {
  const folders = loadWorkspaceFolders()
  const existing = folders.find(
    f => f.workspaceId === workspaceId && f.name === AUTO_RECAP_FOLDER_NAME && !f.parentId,
  )
  if (existing) return existing.id

  const folder: WorkspaceFolder = {
    id: `folder-auto-recaps-${workspaceId}`,
    workspaceId,
    name: AUTO_RECAP_FOLDER_NAME,
    parentId: null,
  }
  saveWorkspaceFolders([...folders, folder])
  return folder.id
}

function groupNotesByPageUrl(notes: Note[]): Record<string, Note[]> {
  return notes.reduce<Record<string, Note[]>>((acc, n) => {
    const key = n.pageUrl || '(no page)'
    ;(acc[key] = acc[key] ?? []).push(n)
    return acc
  }, {})
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatRecapMinute(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function stripMarkdownHeaderPrefix(text: string): string {
  return text
    .replace(/^\*\*([a-z0-9-]+)\*\*\s*/i, '')
    .replace(/^>\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Lowercase, unobtrusive label for what the user did. */
function actionLabelFor(note: Note): string {
  const tags = note.tags ?? []
  const aiTag = ['summary', 'rephrase', 'shorten', 'rewrite', 'ai'].find(t => tags.includes(t))
  if (aiTag) return aiTag === 'ai' ? 'AI' : aiTag
  const featureTag = [
    'highlight', 'sticky', 'anchor', 'paper-note',
    'drawing', 'handwriting', 'stamp', 'clip',
  ].find(t => tags.includes(t))
  if (featureTag) return featureTag.replace(/-/g, ' ')
  if (note.type === 'ai-summary') return 'summary'
  return (note.type || 'capture').replace(/-/g, ' ')
}

function cleanNoteBody(note: Note): string {
  return stripMarkdownHeaderPrefix(stripHtml(note.content ?? ''))
}

function describeDrawing(note: Note): string | null {
  if (!note.tags?.includes('drawing') && note.type !== 'canvas') return null
  const raw = note.content ?? ''
  try {
    const obj = JSON.parse(raw) as { type?: string; points?: unknown[] }
    const kinds: Record<string, string> = {
      path: 'pen stroke', line: 'line', rect: 'rectangle',
      arrow: 'arrow', ellipse: 'ellipse',
    }
    const kind = obj.type ? kinds[obj.type] ?? obj.type : 'sketch'
    const pts = Array.isArray(obj.points) ? obj.points.length : 0
    return pts > 0 ? `Drawing (${kind}, ${pts} points)` : `Drawing (${kind})`
  } catch {
    return 'Drawing'
  }
}

function describeHandwriting(note: Note): string | null {
  if (!note.tags?.includes('handwriting')) return null
  const m = /([0-9]+)\s+handwriting/i.exec(note.content ?? '')
  return m ? `Handwriting (${m[1]} points)` : 'Handwriting'
}

function positionHint(note: Note): string | null {
  const isAnchor = note.type === 'anchor' || note.tags?.includes('anchor')
  if (!isAnchor) return null
  const parts: string[] = []
  if (note.x != null || note.y != null) {
    parts.push(`pinned at ${Math.round(note.x ?? 0)}%, ${Math.round(note.y ?? 0)}%`)
  }
  if (note.lat != null && note.lng != null) {
    parts.push(`location ${note.lat.toFixed(4)}, ${note.lng.toFixed(4)}`)
  }
  return parts.length ? parts.join(' · ') : null
}

function recapEntryHtml(note: Note): string {
  const ts = formatRecapMinute(note.updatedAt ?? note.createdAt)
  const action = actionLabelFor(note)
  const context = note.pageContext?.trim() ?? ''
  const body = cleanNoteBody(note)
  const drawing = describeDrawing(note)
  const handwriting = describeHandwriting(note)
  const position = positionHint(note)

  let html = `<p><em>${htmlEscape(ts)} · ${htmlEscape(action)}</em></p>`

  if (context && context !== body) {
    html += `<blockquote><p>${htmlEscape(context)}</p></blockquote>`
  }

  if (drawing) {
    html += `<p>${htmlEscape(drawing)}</p>`
    if (body && !body.startsWith('{')) html += `<p>${htmlEscape(body)}</p>`
  } else if (handwriting) {
    html += `<p>${htmlEscape(handwriting)}</p>`
    if (body && !/^\d+\s+handwriting/i.test(body)) html += `<p>${htmlEscape(body)}</p>`
  } else if (body) {
    html += `<p>${htmlEscape(body)}</p>`
  } else if (!context) {
    html += `<p><em>Empty capture</em></p>`
  }

  if (position) {
    html += `<p><em>${htmlEscape(position)}</em></p>`
  }

  return html + '<hr>'
}

/** Build a clean Tiptap-compatible HTML recap. */
function composeRecapHtml(_workspaceTitle: string, _pageUrl: string, notes: Note[]): string {
  const pageTitle = titleOf(notes, _pageUrl)
  const domain = domainOf(_pageUrl)
  const sorted = [...notes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  const first = sorted[0]?.createdAt ?? notes[0].createdAt
  const lastNote = sorted[sorted.length - 1] ?? notes[0]
  const last = lastNote.updatedAt ?? lastNote.createdAt
  const totalCount = notes.length

  const overview =
    `<h2>Overview</h2>` +
    `<p>${totalCount} capture${totalCount === 1 ? '' : 's'} from ` +
    `<strong>${htmlEscape(pageTitle)}</strong> (${htmlEscape(domain)}). ` +
    `${formatRecapMinute(first)} – ${formatRecapMinute(last)}.</p>` +
    `<h2>Activity</h2>`

  const entries = sorted.map(recapEntryHtml).join('')
  return overview + entries
}

/** Remove legacy duplicate &lt;h1&gt; from stored recap HTML (title lives on the document). */
export function stripRecapLeadingTitle(html: string): string {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '')
}

/** Strip duplicate meta block shown in the page header (legacy + new recaps). */
export function normalizeRecapContent(html: string): string {
  let out = stripRecapLeadingTitle(html)
  out = out.replace(
    /^\s*<p>\s*<em>\s*Auto-generated recap[\s\S]*?<\/p>\s*/i,
    '',
  )
  return out.trim()
}

/** Find an existing recap for a given page url. */
function findRecapDoc(workspaceId: string, pageUrl: string): FolderDocument | undefined {
  return loadFolderDocuments().find(
    d => d.workspaceId === workspaceId && d.autoGenerated && d.pageUrl === pageUrl,
  )
}

/**
 * Ensure up-to-date recap documents exist for every page represented in the
 * given note set. Returns a map of pageUrl → recap document id so callers can
 * deep-link to it.
 */
export function ensurePageRecaps(
  workspaceId: string,
  workspaceTitle: string,
  notes: Note[],
): Record<string, { id: string; title: string; updatedAt: string; href: string }> {
  if (typeof window === 'undefined' || notes.length === 0) return {}

  const folderId = ensureAutoRecapFolder(workspaceId)
  const grouped = groupNotesByPageUrl(notes)
  const out: Record<string, { id: string; title: string; updatedAt: string; href: string }> = {}

  for (const [pageUrl, pageNotes] of Object.entries(grouped)) {
    if (pageUrl === '(no page)') continue
    if (pageNotes.length === 0) continue

    let existing = findRecapDoc(workspaceId, pageUrl)
    const pageTitle = titleOf(pageNotes, pageUrl)
    const content = composeRecapHtml(workspaceTitle, pageUrl, pageNotes)
    const now = Date.now()

    if (existing && isUnsafeDocId(existing.id)) {
      const newId = recapDocIdForPageUrl(pageUrl, existing.createdAt)
      deleteFolderDocument(existing.id)
      existing = { ...existing, id: newId }
      upsertFolderDocument(existing)
    }

    if (existing) {
      const sourceNewest = pageNotes.reduce((acc, n) => {
        const ts = new Date(n.updatedAt ?? n.createdAt).getTime()
        return ts > acc ? ts : acc
      }, 0)
      const shouldRegen =
        sourceNewest > existing.updatedAt ||
        (!existing.recapStale && now - existing.updatedAt > RECAP_REGEN_INTERVAL_MS)
      if (shouldRegen) {
        upsertFolderDocument({
          ...existing,
          title: pageTitle,
          content,
          updatedAt: now,
          autoGenerated: true,
          pageUrl,
          recapStale: false,
        })
      }
      out[pageUrl] = {
        id: existing.id,
        title: pageTitle,
        updatedAt: new Date(now).toISOString(),
        href: documentHref(workspaceId, existing.id),
      }
    } else {
      const id = recapDocIdForPageUrl(pageUrl, now)
      const doc: FolderDocument = {
        id,
        workspaceId,
        folderId,
        title: pageTitle,
        content,
        createdAt: now,
        updatedAt: now,
        autoGenerated: true,
        pageUrl,
        recapStale: false,
      }
      upsertFolderDocument(doc)
      out[pageUrl] = {
        id,
        title: pageTitle,
        updatedAt: new Date(now).toISOString(),
        href: documentHref(workspaceId, id),
      }
    }
  }

  return out
}
