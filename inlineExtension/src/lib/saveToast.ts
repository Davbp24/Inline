export type SaveToastResponse = {
  ok?: boolean
  storageMode?: 'local' | 'workspace'
  error?: string
}

export function emitSaveToast(response: SaveToastResponse | undefined): void {
  if (!response?.ok) return
  if (response.storageMode !== 'workspace') return
  document.dispatchEvent(new CustomEvent('inline:toast', {
    detail: { message: 'Saved to Workspace', tone: 'success', action: 'dashboard' },
  }))
}
