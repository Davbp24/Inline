'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import HeroCaptureGrid from '@/components/marketing/HeroCaptureGrid'
import HeroAtmosphere from '@/components/marketing/HeroAtmosphere'
import { SectionLink } from '@/components/marketing/SectionLink'
import { cn } from '@/lib/utils'
import {
  launch,
  launchDisplay,
  launchEyebrow,
  mktBtnPrimaryLg,
  mktBtnTextLink,
} from '@/components/marketing/marketingSurfaces'

const ROTATING_WORDS = ['Memory', 'Highlights', 'Notes', 'Captures', 'Context', 'Answers']
const WORD_INTERVAL_MS = 4200
const WIDTH_MS = 0.55
const FADE_MS = 0.45

function HeroRotatingWord({ paused }: { paused: boolean }) {
  const [index, setIndex] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [wordWidth, setWordWidth] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % ROTATING_WORDS.length)
    }, WORD_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused])

  const word = ROTATING_WORDS[index]!
  const displayWord = paused ? ROTATING_WORDS[0]! : word

  const measureWidth = useCallback(() => {
    const el = measureRef.current
    if (!el) return
    const width = el.getBoundingClientRect().width
    if (width > 0) setWordWidth(width)
  }, [displayWord])

  useLayoutEffect(() => {
    measureWidth()
  }, [measureWidth])

  useEffect(() => {
    window.addEventListener('resize', measureWidth)
    return () => window.removeEventListener('resize', measureWidth)
  }, [measureWidth])

  return (
    <motion.span
      aria-live="polite"
      className="relative inline-block align-baseline overflow-hidden whitespace-nowrap"
      initial={false}
      animate={wordWidth !== undefined ? { width: wordWidth } : undefined}
      style={wordWidth === undefined ? { width: 'auto' } : undefined}
      transition={
        paused || wordWidth === undefined
          ? { duration: 0 }
          : { duration: WIDTH_MS, ease: launch.ease }
      }
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap opacity-0"
      >
        {displayWord}
      </span>
      <span className="inline-block text-right whitespace-nowrap">
        {paused ? (
          displayWord
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={word}
              className="inline-block whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: FADE_MS, ease: launch.ease }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </motion.span>
  )
}

function HeroCopy({
  fade,
  reduce,
  align = 'center',
}: {
  fade: (delay?: number) => Record<string, unknown>
  reduce: boolean | null
  align?: 'center' | 'left'
}) {
  const isLeft = align === 'left'

  return (
    <div className={`relative min-h-0 ${isLeft ? 'text-left' : 'text-center'}`}>
      <motion.p {...fade(0)} className={cn(launchEyebrow, 'text-stone-600')}>
        Introducing Inline
      </motion.p>

      <motion.h1
        {...fade(0.12)}
        className={`mt-5 ${launchDisplay}`}
      >
        <span
          className={`inline-flex flex-nowrap items-baseline gap-x-[0.25em] whitespace-nowrap ${isLeft ? 'justify-start' : 'justify-center'}`}
        >
          <HeroRotatingWord paused={!!reduce} />
          <span>for the web.</span>
        </span>
      </motion.h1>

      <motion.p
        {...fade(0.24)}
        className={`mt-5 max-w-md text-pretty text-base leading-relaxed text-stone-700 sm:text-lg ${isLeft ? '' : 'mx-auto'}`}
      >
        Capture, search, and remember everything you read online.
      </motion.p>

      <motion.div
        {...fade(0.36)}
        className={`mt-8 flex flex-col gap-4 sm:flex-row sm:items-center ${isLeft ? 'justify-start' : 'items-center justify-center'}`}
      >
        <Link href="/install" className={`w-full sm:w-auto ${mktBtnPrimaryLg}`}>
          Add to Chrome
        </Link>
        <SectionLink href="/#product" className={cn(mktBtnTextLink, 'text-stone-700')}>
          See how it works
        </SectionLink>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -16])
  const keycapOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.55, 0.3])

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: launch.durationHero, delay, ease: launch.ease },
        }

  return (
    <section
      ref={heroRef}
      data-hero
      data-hero-dark="false"
      className="relative flex min-h-svh w-full flex-col overflow-hidden text-[#1C1E26]"
    >
      <HeroAtmosphere />

      {/* Desktop exponential keycap area — absolute, fades on scroll */}
      <motion.div
        style={{ opacity: reduce ? 1 : keycapOpacity }}
        className="pointer-events-none absolute inset-0 z-5 hidden lg:block"
      >
        <HeroCaptureGrid layout="exponential" />
      </motion.div>

      <motion.div
        style={{ y: reduce ? 0 : contentY }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 pt-20 pb-12 sm:px-8 sm:pt-28 sm:pb-20 lg:min-h-[calc(100svh-5rem)] lg:justify-center lg:px-10 lg:pt-32 lg:pb-24"
      >
        {/* Mobile / tablet — stacked layout */}
        <div className="flex w-full flex-col items-center lg:hidden">
          <HeroCopy fade={fade} reduce={reduce} align="center" />
          <motion.div {...fade(0.48)} className="mt-8 w-full min-h-0 shrink-0 sm:mt-10">
            <HeroCaptureGrid layout="stacked" />
          </motion.div>
        </div>

        {/* Desktop — left-aligned copy */}
        <div className="hidden w-full max-w-xl lg:block">
          <HeroCopy fade={fade} reduce={reduce} align="left" />
        </div>
      </motion.div>
    </section>
  )
}
