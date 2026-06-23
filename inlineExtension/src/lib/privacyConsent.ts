import { useCallback, useEffect, useState } from 'react'

export const PRIVACY_CONSENT_KEY = 'inlinePrivacyAccepted'

export function readPrivacyAccepted(): Promise<boolean> {
  return new Promise(resolve => {
    if (!chrome.runtime?.id) {
      resolve(true)
      return
    }
    chrome.storage.local.get([PRIVACY_CONSENT_KEY], stored => {
      resolve(
        stored[PRIVACY_CONSENT_KEY] === 'true' || stored[PRIVACY_CONSENT_KEY] === true,
      )
    })
  })
}

export function acceptPrivacy(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!chrome.runtime?.id) {
      resolve()
      return
    }
    chrome.storage.local.set({ [PRIVACY_CONSENT_KEY]: 'true' }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      resolve()
    })
  })
}

export function usePrivacyConsent(): {
  ready: boolean
  accepted: boolean
  accept: () => void
} {
  const [ready, setReady] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    void readPrivacyAccepted().then(value => {
      setAccepted(value)
      setReady(true)
    })
  }, [])

  const accept = useCallback(() => {
    setAccepted(true)
    void acceptPrivacy().catch(() => {
      setAccepted(false)
    })
  }, [])

  return { ready, accepted, accept }
}
