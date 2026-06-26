import { useEffect } from 'react'
import PrivacyDisclosure from '../components/PrivacyDisclosure'
import PanelHost from './PanelHost'
import SmartOverlay from './SmartOverlay'
import StickyNotesManager from './StickyNotesManager'
import { restoreAIReplacements } from './aiReplacements'
import { restoreManualRewrites } from './manualRewrites'
import { restoreDrawings } from './drawingsRestore'
import { restoreHandwriting } from './handwritingRestore'
import { restoreHighlights } from './highlightWrap'
import { DEFAULT_WEB_URL } from '../lib/inlineUrls'
import { usePrivacyConsent } from '../lib/privacyConsent'
import { loadSettings } from '../lib/extensionSettings'

function openPrivacyPolicy() {
  void loadSettings()
    .then(s => { window.open(`${s.apiBaseUrl}/privacy`, '_blank') })
    .catch(() => { window.open(`${DEFAULT_WEB_URL}/privacy`, '_blank') })
}

/**
 * Gates all capture UI until the user accepts the first-run privacy disclosure.
 */
export default function ContentShell() {
  const { ready, accepted, accept } = usePrivacyConsent()

  useEffect(() => {
    if (accepted) {
      document.dispatchEvent(new CustomEvent('inline:privacyAccepted'))
    }
  }, [accepted])

  useEffect(() => {
    if (!accepted) return
    const timer = window.setTimeout(() => {
      restoreHighlights()
      restoreDrawings()
      restoreHandwriting()
      restoreAIReplacements()
      restoreManualRewrites()
    }, 800)
    return () => window.clearTimeout(timer)
  }, [accepted])

  if (!ready) return null

  if (!accepted) {
    return (
      <PrivacyDisclosure
        onAccept={accept}
        onPrivacyPolicy={openPrivacyPolicy}
      />
    )
  }

  return (
    <>
      <SmartOverlay />
      <StickyNotesManager />
      <PanelHost />
    </>
  )
}
