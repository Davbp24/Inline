/**
 * Sticky Note Storage Layer
 *
 * Sticky notes persist through the background worker so browser-only copies
 * are encrypted and signed-in copies can sync to the workspace.
 */

export interface StickyNoteData {
  id: string
  pageUrl: string
  x: number
  y: number
  width: number
  height: number
  content: string
  color: string
  title?: string
  createdAt: number
  updatedAt: number
  mediaTimestamp?: number
}

/**
 * Load all sticky notes for a given page URL.
 * Returns an empty array if no notes are saved.
 */
export async function loadNotes(pageUrl: string): Promise<StickyNoteData[]> {
  return new Promise((resolve) => {
    if (!chrome.runtime?.id) {
      resolve([])
      return
    }
    chrome.runtime.sendMessage(
      { type: 'LOAD_ANNOTATIONS', payload: { pageUrl } },
      (response) => {
        if (chrome.runtime.lastError || !response?.ok) {
          resolve([])
          return
        }
        const notes = response.data?.elements?.stickyNotes
        resolve(Array.isArray(notes) ? notes as StickyNoteData[] : [])
      },
    )
  })
}

/**
 * Save all sticky notes for a given page URL.
 * Overwrites the entire array for that URL.
 */
export async function saveNotes(pageUrl: string, notes: StickyNoteData[]): Promise<void> {
  return new Promise((resolve) => {
    if (!chrome.runtime?.id) {
      resolve()
      return
    }
    chrome.runtime.sendMessage(
      {
        type: 'SAVE_ANNOTATIONS',
        payload: {
          pageUrl,
          featureKey: 'stickyNotes',
          data: notes,
          pageTitle: document.title,
          domain: window.location.hostname,
          clearedAt: notes.length === 0 ? Date.now() : null,
        },
      },
      () => {
        resolve()
      },
    )
  })
}

/**
 * Delete a single sticky note by ID for a given page URL.
 * Loads existing notes, filters out the target, and saves back.
 */
export async function deleteNote(pageUrl: string, noteId: string): Promise<void> {
  const notes = await loadNotes(pageUrl)
  const filtered = notes.filter((n) => n.id !== noteId)
  await saveNotes(pageUrl, filtered)
}

/**
 * Generate a unique ID for a new sticky note.
 * Uses crypto.randomUUID() which is available in modern browsers.
 */
export function generateNoteId(): string {
  return crypto.randomUUID()
}
