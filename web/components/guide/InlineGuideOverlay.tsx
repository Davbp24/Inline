'use client'

import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import InlineGuideCard from '@/components/guide/InlineGuideCard'
import { useInlineGuide } from '@/lib/inline-guide-context'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const TARGET_POLL_MS = 100
const TARGET_POLL_MAX = 30

const STEP_FEATURE_ROW: Partial<Record<string, string>> = {
  home: 'nav-home',
  captures: 'nav-captures',
  analytics: 'nav-analytics',
  settings: 'nav-settings',
}

type Rect = { top: number; left: number; width: number; height: number }

const CARD_ESTIMATE_HEIGHT = 300
const CARD_MAX_WIDTH = 384

function measureTarget(selector: string, viewportHeight = 800): Rect | null {
  const el = document.querySelector(`[data-inline-guide="${selector}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 1 && r.height < 1) return null
  const pad =
    selector === 'settings-page' ? 0
      : selector === 'document-editor' ? 12
        : selector.startsWith('nav-') ? 6
          : 8
  let height = r.height + pad * 2
  if (selector === 'document-editor') {
    height = Math.min(height, Math.min(420, viewportHeight * 0.45))
  }
  return {
    top: Math.max(8, r.top - pad),
    left: Math.max(8, r.left - pad),
    width: r.width + pad * 2,
    height,
  }
}

function resolveCardLayout(
  rect: Rect,
  viewportHeight: number,
  viewportWidth: number,
  stepId?: string,
  chatPreview?: boolean,
): { centered: boolean; style?: CSSProperties; docked?: boolean } {
  if (stepId === 'ask-inline' && chatPreview) {
    return {
      centered: false,
      docked: true,
      style: {
        bottom: 24,
        left: 24,
        right: 'auto',
        top: 'auto',
        transform: 'none',
      },
    }
  }

  if (stepId === 'ask-inline') {
    return {
      centered: false,
      docked: true,
      style: {
        bottom: 88,
        left: 24,
        right: 'auto',
        top: 'auto',
        transform: 'none',
      },
    }
  }

  if (stepId === 'auto-recap') {
    return {
      centered: false,
      docked: true,
      style: {
        top: 80,
        right: 24,
        left: 'auto',
        bottom: 'auto',
        transform: 'none',
      },
    }
  }

  const belowTop = rect.top + rect.height + 12
  const fitsBelow = belowTop + CARD_ESTIMATE_HEIGHT < viewportHeight - 16
  const tallTarget = rect.height > viewportHeight * 0.5
  const wideTarget = rect.width > viewportWidth * 0.42
  const rightLeft = rect.left + rect.width + 16
  const fitsRight = rightLeft + CARD_MAX_WIDTH < viewportWidth - 16
  const leftPos = rect.left - CARD_MAX_WIDTH - 16
  const fitsLeft = leftPos >= 68

  if ((tallTarget || wideTarget) && fitsRight) {
    return {
      centered: false,
      style: {
        top: Math.max(16, Math.min(rect.top, viewportHeight - CARD_ESTIMATE_HEIGHT - 16)),
        left: rightLeft,
        right: 'auto',
        transform: 'none',
      },
    }
  }

  if ((tallTarget || wideTarget) && fitsLeft) {
    return {
      centered: false,
      style: {
        top: Math.max(16, Math.min(rect.top, viewportHeight - CARD_ESTIMATE_HEIGHT - 16)),
        left: leftPos,
        right: 'auto',
        transform: 'none',
      },
    }
  }

  if (tallTarget || wideTarget) {
    return {
      centered: false,
      docked: true,
      style: {
        bottom: 24,
        right: 24,
        left: 'auto',
        top: 'auto',
        transform: 'none',
      },
    }
  }

  if (rect.top > viewportHeight * 0.45) {
    return {
      centered: false,
      style: {
        top: Math.max(16, rect.top - 12),
        transform: 'translateY(-100%)',
      },
    }
  }

  return {
    centered: false,
    style: { top: belowTop },
  }
}

export default function InlineGuideOverlay() {
  const {
    active,
    step,
    stepIndex,
    totalSteps,
    chatPreview,
    next,
    back,
    skipTour,
    openChatPanel,
  } = useInlineGuide()

  const pathname = usePathname()
  const [rect, setRect] = useState<Rect | null>(null)
  const [targetReady, setTargetReady] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(800)
  const [viewportWidth, setViewportWidth] = useState(1200)

  useEffect(() => {
    const update = () => {
      setViewportHeight(window.innerHeight)
      setViewportWidth(window.innerWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const updateRect = useCallback(() => {
    if (!active || !step || step.centerCard || !step.target) {
      setRect(null)
      setTargetReady(false)
      return
    }
    const nextRect = measureTarget(step.target, viewportHeight)
    setRect(nextRect)
    setTargetReady(Boolean(nextRect))
  }, [active, step, viewportHeight])

  useEffect(() => {
    updateRect()
    if (!active) return

    let attempts = 0
    const poll = window.setInterval(() => {
      attempts += 1
      const nextRect = step?.target && !step.centerCard ? measureTarget(step.target, viewportHeight) : null
      if (nextRect) {
        setRect(nextRect)
        setTargetReady(true)
        window.clearInterval(poll)
        return
      }
      if (attempts >= TARGET_POLL_MAX) {
        window.clearInterval(poll)
      }
    }, TARGET_POLL_MS)

    const id = window.setTimeout(updateRect, 120)
    const id2 = window.setTimeout(updateRect, 400)
    const id3 = window.setTimeout(updateRect, 800)
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    return () => {
      window.clearInterval(poll)
      window.clearTimeout(id)
      window.clearTimeout(id2)
      window.clearTimeout(id3)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [active, pathname, step, stepIndex, updateRect, viewportHeight])

  useEffect(() => {
    if (!active || step?.id !== 'auto-recap') return
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [active, pathname, step?.id, stepIndex])

  useEffect(() => {
    if (!active || !step?.target) return

    const el = document.querySelector(`[data-inline-guide="${step.target}"]`)
    if (!el) return
    el.setAttribute('data-inline-guide-active', '')

    return () => {
      el.removeAttribute('data-inline-guide-active')
    }
  }, [active, step?.target, stepIndex, targetReady])

  useEffect(() => {
    if (!active || !step) return

    document.querySelectorAll('[data-inline-guide-focus]').forEach(node => {
      node.removeAttribute('data-inline-guide-focus')
    })

    const rowId = STEP_FEATURE_ROW[step.id]
    if (!rowId) return

    const row = document.querySelector(`[data-inline-guide="${rowId}"]`)
    row?.setAttribute('data-inline-guide-focus', '')

    return () => {
      row?.removeAttribute('data-inline-guide-focus')
    }
  }, [active, step, stepIndex])

  if (!active || !step) return null

  const chatPreviewMode = chatPreview && step.id === 'ask-inline'
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1
  const hasSpotlight = Boolean(rect && !step.centerCard && !chatPreviewMode)
  const waitingForTarget = Boolean(step.target && !step.centerCard && !targetReady && !chatPreviewMode)
  const centered = step.centerCard || (!hasSpotlight && !step.target && !chatPreviewMode)
  const scrimAlpha = step.lightScrim ? 0.22 : 0.38
  const anchoredLayout = (hasSpotlight && rect) || chatPreviewMode
    ? resolveCardLayout(
        rect ?? { top: 0, left: 0, width: 0, height: 0 },
        viewportHeight,
        viewportWidth,
        step.id,
        chatPreviewMode,
      )
    : null
  const cardCentered = !chatPreviewMode && (centered || waitingForTarget || anchoredLayout?.centered)

  return (
    <AnimatePresence>
      <motion.div
        key="guide-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed inset-0 z-[100] pointer-events-none"
        aria-hidden={false}
      >
        {hasSpotlight ? (
          <div
            className="pointer-events-auto absolute z-[100] rounded-xl transition-all duration-300 ease-out ring-2 ring-primary/40"
            style={{
              top: rect!.top,
              left: rect!.left,
              width: rect!.width,
              height: rect!.height,
              boxShadow: `0 0 0 9999px rgba(15, 23, 42, ${scrimAlpha})`,
            }}
          />
        ) : chatPreviewMode ? (
          <div className="pointer-events-auto absolute inset-0 z-[100] bg-background/45 backdrop-blur-md" />
        ) : waitingForTarget ? (
          <div className="pointer-events-auto absolute inset-0 z-[100] bg-background/20" />
        ) : (
          <div className="pointer-events-auto absolute inset-0 z-[100] bg-background/50 backdrop-blur-md" />
        )}

        <div
          className={cn(
            'pointer-events-auto absolute z-[101]',
            cardCentered
              ? 'inset-0 flex items-center justify-center px-4'
              : anchoredLayout?.docked
                ? 'px-4'
                : 'left-0 right-0 px-4',
          )}
          style={!cardCentered && anchoredLayout?.style ? anchoredLayout.style : undefined}
        >
          <InlineGuideCard
            title={step.title}
            body={step.body}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            suggestedPrompt={step.suggestedPrompt}
            showOpenChat={step.openChat}
            onNext={next}
            onBack={back}
            onSkip={skipTour}
            onOpenChat={openChatPanel}
            isFirst={isFirst}
            isLast={isLast}
            className={step.id === 'auto-recap' || chatPreviewMode ? 'bg-card shadow-xl backdrop-blur-none' : undefined}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function InlineGuideResumeChip() {
  const { paused, resume, dismissGuide, stepIndex, totalSteps } = useInlineGuide()

  if (!paused) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-[99] flex items-center gap-2 rounded-full border border-border bg-card/95 py-1.5 pl-2 pr-1.5 shadow-md backdrop-blur-md"
    >
      <Compass className="ml-1 h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="text-xs font-medium text-foreground">
        Resume guide ({stepIndex + 1}/{totalSteps})
      </span>
      <button
        type="button"
        onClick={resume}
        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground cursor-pointer"
      >
        Continue
      </button>
      <button
        type="button"
        onClick={dismissGuide}
        className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="Dismiss guide"
      >
        ×
      </button>
    </motion.div>
  )
}
