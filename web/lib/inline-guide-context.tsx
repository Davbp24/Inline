'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  GUIDE_RESTART_EVENT,
  GUIDE_STEPS,
  completeGuide,
  guideStepByIndex,
  isDashboardPath,
  loadGuideState,
  patchGuideState,
  resetGuide,
  resolveGuideDocumentHref,
  type GuideStep,
} from '@/lib/inline-guide'
import { isDocumentEditorPath } from '@/lib/document-editor-view'
import { resolveWorkspaceIdFromBrowserPath, workspacePath } from '@/lib/workspace-routes'
import { useSidebar } from '@/lib/sidebar-context'
import { useChatPanel } from '@/lib/chat-panel-context'

type InlineGuideContextValue = {
  active: boolean
  paused: boolean
  chatPreview: boolean
  stepIndex: number
  step: GuideStep | undefined
  workspaceId: string
  totalSteps: number
  next: () => void
  back: () => void
  pause: () => void
  resume: () => void
  skipTour: () => void
  dismissGuide: () => void
  start: () => void
  openChatPanel: () => void
}

const InlineGuideContext = createContext<InlineGuideContextValue | null>(null)

function routeForStep(workspaceId: string, step: GuideStep): string | null {
  if (step.navigateToGuideDoc) {
    return resolveGuideDocumentHref(workspaceId)
  }
  switch (step.route) {
    case 'dashboard':
      return workspacePath(workspaceId, 'dashboard')
    case 'history':
      return workspacePath(workspaceId, 'history')
    case 'analytics':
      return workspacePath(workspaceId, 'analytics')
    case 'settings':
      return workspacePath(workspaceId, 'settings')
    default:
      return null
  }
}

export function InlineGuideProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const workspaceId = resolveWorkspaceIdFromBrowserPath(pathname)
  const { collapsed, setCollapsed } = useSidebar()
  const { setOpen: setChatOpen, open: chatOpen } = useChatPanel()

  const [active, setActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [chatPreview, setChatPreview] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const prevPathnameRef = useRef(pathname)

  const step = guideStepByIndex(stepIndex)

  const syncFromStorage = useCallback(() => {
    const state = loadGuideState(workspaceId)
    setPaused(!!state.guidePaused)
    setStepIndex(state.guideStepIndex ?? 0)
    if (state.guideCompleted) {
      setActive(false)
    }
  }, [workspaceId])

  useEffect(() => {
    syncFromStorage()
    setHydrated(true)
  }, [syncFromStorage, workspaceId])

  const start = useCallback(() => {
    resetGuide(workspaceId)
    setStepIndex(0)
    setPaused(false)
    setChatPreview(false)
    setActive(true)
    router.push(workspacePath(workspaceId, 'dashboard'))
  }, [router, workspaceId])

  useEffect(() => {
    const onRestart = () => start()
    window.addEventListener(GUIDE_RESTART_EVENT, onRestart)
    return () => window.removeEventListener(GUIDE_RESTART_EVENT, onRestart)
  }, [start])

  useEffect(() => {
    if (!hydrated) return
    const state = loadGuideState(workspaceId)
    if (state.guideCompleted || state.guidePaused) return

    const idx = state.guideStepIndex ?? 0
    const onDashboard = isDashboardPath(pathname)
    const inProgress = idx > 0
    if (!inProgress && !(idx === 0 && onDashboard)) return

    setActive(true)
    setPaused(false)
    setStepIndex(idx)
  }, [hydrated, pathname, workspaceId])

  useEffect(() => {
    if (!active || paused || !step) return
    if (step.id === 'auto-recap' || step.id === 'ask-inline') return
    if (isDocumentEditorPath(pathname)) {
      setPaused(true)
      setActive(false)
      patchGuideState(workspaceId, { guidePaused: true, guideStepIndex: stepIndex })
    }
  }, [active, paused, pathname, step, stepIndex, workspaceId])

  useEffect(() => {
    if (!hydrated || step?.id !== 'ask-inline') {
      prevPathnameRef.current = pathname
      return
    }
    const state = loadGuideState(workspaceId)
    const wasDashboard = isDashboardPath(prevPathnameRef.current)
    const onDashboard = isDashboardPath(pathname)
    prevPathnameRef.current = pathname
    if (!state.guidePaused || !onDashboard || wasDashboard) return
    setPaused(false)
    setActive(true)
    patchGuideState(workspaceId, { guidePaused: false })
  }, [hydrated, pathname, step?.id, workspaceId])

  useEffect(() => {
    if (step?.id !== 'ask-inline' || !chatPreview || chatOpen) return
    setChatPreview(false)
  }, [chatOpen, chatPreview, step?.id])

  useEffect(() => {
    if (!active || paused || !step?.target) return
    if (!step.target.startsWith('nav-') && step.target !== 'settings-page') return
    if (collapsed) setCollapsed(false)
  }, [active, collapsed, paused, setCollapsed, step?.target])

  const navigateForStep = useCallback((targetStep: GuideStep) => {
    const href = routeForStep(workspaceId, targetStep)
    if (href && pathname !== href) {
      router.push(href)
    }
  }, [pathname, router, workspaceId])

  const goToStep = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, GUIDE_STEPS.length - 1))
    const targetStep = guideStepByIndex(clamped)
    if (!targetStep) return

    if (targetStep.id === 'auto-recap' && !resolveGuideDocumentHref(workspaceId)) {
      const skipTo = GUIDE_STEPS.findIndex(s => s.id === 'ask-inline')
      const nextIdx = skipTo >= 0 ? skipTo : clamped
      const askStep = guideStepByIndex(skipTo)
      if (askStep) {
        setChatOpen(false)
        setChatPreview(false)
        navigateForStep(askStep)
      }
      setStepIndex(nextIdx)
      setActive(true)
      setPaused(false)
      patchGuideState(workspaceId, { guideStepIndex: nextIdx, guidePaused: false })
      return
    }

    const currentStep = guideStepByIndex(stepIndex)
    if (currentStep?.id === 'ask-inline' && targetStep.id !== 'ask-inline') {
      setChatOpen(false)
    }
    if (targetStep.id === 'ask-inline') {
      setChatOpen(false)
      setChatPreview(false)
    } else {
      setChatPreview(false)
    }
    if (targetStep.id === 'folders' || targetStep.id === 'finish') {
      setCollapsed(false)
    }
    navigateForStep(targetStep)
    setStepIndex(clamped)
    setActive(true)
    setPaused(false)
    patchGuideState(workspaceId, { guideStepIndex: clamped, guidePaused: false })
  }, [navigateForStep, setChatOpen, setCollapsed, stepIndex, workspaceId])

  const next = useCallback(() => {
    const current = guideStepByIndex(stepIndex)
    if (current?.id === 'finish') {
      completeGuide(workspaceId)
      setActive(false)
      setPaused(false)
      setChatPreview(false)
      setChatOpen(false)
      router.push(workspacePath(workspaceId, 'dashboard'))
      return
    }

    const nextIndex = stepIndex + 1
    if (nextIndex >= GUIDE_STEPS.length) {
      completeGuide(workspaceId)
      setActive(false)
      setChatPreview(false)
      return
    }

    goToStep(nextIndex)
  }, [goToStep, router, setChatOpen, stepIndex, workspaceId])

  const back = useCallback(() => {
    if (stepIndex > 0) goToStep(stepIndex - 1)
  }, [goToStep, stepIndex])

  const pause = useCallback(() => {
    setPaused(true)
    setActive(false)
    setChatPreview(false)
    patchGuideState(workspaceId, { guidePaused: true, guideStepIndex: stepIndex })
  }, [stepIndex, workspaceId])

  const resume = useCallback(() => {
    setPaused(false)
    setActive(true)
    patchGuideState(workspaceId, { guidePaused: false, guideStepIndex: stepIndex })
    const current = guideStepByIndex(stepIndex)
    if (current) {
      if (current.id === 'ask-inline') setChatOpen(false)
      navigateForStep(current)
    }
  }, [navigateForStep, setChatOpen, stepIndex, workspaceId])

  const skipTour = useCallback(() => {
    pause()
  }, [pause])

  const dismissGuide = useCallback(() => {
    completeGuide(workspaceId)
    setPaused(false)
    setActive(false)
    setChatPreview(false)
  }, [workspaceId])

  const openChatPanel = useCallback(() => {
    setChatOpen(true)
    setChatPreview(true)
  }, [setChatOpen])

  const value = useMemo(
    () => ({
      active,
      paused,
      chatPreview,
      stepIndex,
      step,
      workspaceId,
      totalSteps: GUIDE_STEPS.length,
      next,
      back,
      pause,
      resume,
      skipTour,
      dismissGuide,
      start,
      openChatPanel,
    }),
    [
      active,
      back,
      chatPreview,
      dismissGuide,
      next,
      openChatPanel,
      pause,
      paused,
      resume,
      skipTour,
      start,
      step,
      stepIndex,
      workspaceId,
    ],
  )

  return (
    <InlineGuideContext.Provider value={value}>
      {children}
    </InlineGuideContext.Provider>
  )
}

export function useInlineGuide() {
  const ctx = useContext(InlineGuideContext)
  if (!ctx) {
    throw new Error('useInlineGuide must be used within InlineGuideProvider')
  }
  return ctx
}

export function useInlineGuideOptional() {
  return useContext(InlineGuideContext)
}

export function restartInlineGuide() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(GUIDE_RESTART_EVENT))
}
