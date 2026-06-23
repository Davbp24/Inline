import { decryptJson, encryptJson, isEncryptedJson } from './localCrypto'

const QUEUE_KEY = 'inlineSyncQueue'
const ENCRYPTED_QUEUE_KEY = 'inlineSyncQueueEncrypted'

export interface QueuedPayload {
  pageUrl: string
  featureKey: string
  data: unknown
  timestamp: number
}

export async function enqueue(payload: QueuedPayload): Promise<void> {
  const queue = await getQueue()
  queue.push(payload)
  await persistQueue(queue)
}

export async function getQueue(): Promise<QueuedPayload[]> {
  const stored = await chrome.storage.local.get([ENCRYPTED_QUEUE_KEY, QUEUE_KEY])
  if (isEncryptedJson(stored[ENCRYPTED_QUEUE_KEY])) {
    try {
      const decrypted = await decryptJson<QueuedPayload[]>(stored[ENCRYPTED_QUEUE_KEY])
      return Array.isArray(decrypted) ? decrypted : []
    } catch {
      return []
    }
  }

  const legacy = stored[QUEUE_KEY]
  if (Array.isArray(legacy)) {
    await persistQueue(legacy as QueuedPayload[])
    return legacy as QueuedPayload[]
  }
  return []
}

export async function clearQueue(): Promise<void> {
  await chrome.storage.local.remove([QUEUE_KEY, ENCRYPTED_QUEUE_KEY])
}

export async function dequeue(): Promise<QueuedPayload | undefined> {
  const queue = await getQueue()
  const item = queue.shift()
  await persistQueue(queue)
  return item
}

export async function persistQueue(queue: QueuedPayload[]): Promise<void> {
  const encrypted = await encryptJson(queue)
  await chrome.storage.local.set({ [ENCRYPTED_QUEUE_KEY]: encrypted })
  await chrome.storage.local.remove(QUEUE_KEY)
}
