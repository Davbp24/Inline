'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const STEP_MS = 4500

const STEPS = [
  {
    id: 'stale',
    text: 'How loads transfer across suspension cables and anchor points.',
    footer: 'Last updated 4 days ago',
  },
  {
    id: 'fresh',
    text: 'Towers carry deck loads directly through stay cables. Your highlights note shorter construction time vs suspension designs.',
    footer: 'Last updated today',
  },
] as const

type RecapStatusCardAnimatedProps = {
  className?: string
}

export default function RecapStatusCardAnimated({ className }: RecapStatusCardAnimatedProps) {
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const current = STEPS[step]!

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => setStep(s => (s + 1) % STEPS.length), STEP_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return (
    <div
      className={cn('w-full max-w-[342px] rounded-[10px] border border-border bg-card p-4', className)}
      aria-live="polite"
    >
      <motion.span
        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-foreground"
        animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 0.55, repeat: Infinity, repeatDelay: STEP_MS / 1000 - 0.55, ease: EASE }}
      >
        <Check className="h-3 w-3 text-[#22C55E]" aria-hidden />
        Self-updating recap
      </motion.span>

      <div className="relative mt-3 min-h-[4.75rem] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={current.id}
            className="text-sm leading-relaxed text-foreground"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
          >
            {current.text}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={current.footer}
          className="mt-2 text-xs text-muted-foreground"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
        >
          {current.footer}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
