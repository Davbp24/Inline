const KEY_STORAGE_KEY = 'inlineLocalDataKey'

export type EncryptedJson = {
  __inlineEncrypted: true
  v: 1
  alg: 'AES-GCM'
  iv: string
  ciphertext: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export function isEncryptedJson(value: unknown): value is EncryptedJson {
  return !!value
    && typeof value === 'object'
    && (value as EncryptedJson).__inlineEncrypted === true
    && (value as EncryptedJson).v === 1
    && (value as EncryptedJson).alg === 'AES-GCM'
    && typeof (value as EncryptedJson).iv === 'string'
    && typeof (value as EncryptedJson).ciphertext === 'string'
}

async function getLocalKey(): Promise<CryptoKey> {
  const stored = await chrome.storage.local.get(KEY_STORAGE_KEY)
  const jwk = stored[KEY_STORAGE_KEY]
  if (jwk && typeof jwk === 'object') {
    return crypto.subtle.importKey('jwk', jwk as JsonWebKey, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
  }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('jwk', key)
  await chrome.storage.local.set({ [KEY_STORAGE_KEY]: exported })
  return key
}

export async function encryptJson(value: unknown): Promise<EncryptedJson> {
  const key = await getLocalKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = encoder.encode(JSON.stringify(value))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(plaintext))
  return {
    __inlineEncrypted: true,
    v: 1,
    alg: 'AES-GCM',
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(cipher)),
  }
}

export async function decryptJson<T = unknown>(payload: EncryptedJson): Promise<T> {
  const key = await getLocalKey()
  const iv = base64ToBytes(payload.iv)
  const cipher = base64ToBytes(payload.ciphertext)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(cipher))
  return JSON.parse(decoder.decode(plaintext)) as T
}
