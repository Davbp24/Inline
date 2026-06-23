import { motion } from 'framer-motion'
import { PANEL as C, FONT } from '../lib/extensionTheme'
import { INLINE_PRODUCTION_ORIGIN } from '../lib/inlineUrls'
import { BrandMark, SectionLabel } from './panelKit'

interface PrivacyDisclosureProps {
  onAccept: () => void
  onPrivacyPolicy: () => void
}

const BULLETS = [
  'Inline only works when you use it — highlights, notes, drawings, screenshots, or AI on the page you are viewing.',
  'Without an account, your captures stay in this browser only.',
  `When you sign in, captures sync to your workspace at ${INLINE_PRODUCTION_ORIGIN}.`,
  'Guest AI is limited to 10 prompts on this device. We never sell your data or use it for ads.',
] as const

/**
 * First-run privacy disclosure — uses the same panel chrome as Settings and AI tools.
 */
export default function PrivacyDisclosure({ onAccept, onPrivacyPolicy }: PrivacyDisclosureProps) {
  return (
    <motion.div
      data-inline-interactive=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '18px 16px 0',
        background: 'rgba(28, 30, 38, 0.28)',
        backdropFilter: 'blur(2px)',
        fontFamily: FONT,
      }}
    >
      <motion.div
        role="dialog"
        aria-labelledby="inline-privacy-title"
        aria-describedby="inline-privacy-desc"
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          width: 'min(388px, 100%)',
          height: 'fit-content',
          borderRadius: C.radius,
          border: `1px solid ${C.border}`,
          background: C.bg,
          boxShadow: C.shadowOuter,
          color: C.text,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minHeight: 56,
            padding: '0 20px',
            background: C.headerBg,
            flexShrink: 0,
          }}
        >
          <BrandMark size={24} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              id="inline-privacy-title"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: C.text,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Before you capture
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: C.textMuted,
                lineHeight: 1.2,
              }}
            >
              Review how Inline handles page content.
            </div>
          </div>
        </header>

        <div id="inline-privacy-desc" style={{ padding: '16px 18px 18px' }}>
          <SectionLabel>What to know</SectionLabel>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gap: 8,
          }}>
            {BULLETS.map(line => (
              <li
                key={line}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: C.radiusMd,
                  border: `1px solid ${C.border}`,
                  background: C.surfaceBubble,
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: C.textMuted,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    marginTop: 5,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: C.link,
                    flexShrink: 0,
                  }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 16px',
            borderTop: `1px solid ${C.divider}`,
            background: 'rgba(255,255,255,0.95)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onPrivacyPolicy}
            style={{
              border: `1px solid ${C.border}`,
              background: C.surfaceBubble,
              color: C.text,
              borderRadius: C.radiusPill,
              padding: '9px 14px',
              fontSize: 12.5,
              fontWeight: 650,
              cursor: 'pointer',
              fontFamily: FONT,
              boxShadow: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Privacy policy
          </button>
          <button
            type="button"
            onClick={onAccept}
            style={{
              border: 'none',
              background: C.accent,
              color: '#FFFFFF',
              borderRadius: C.radiusPill,
              padding: '9px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: FONT,
              boxShadow: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            I agree
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
