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
import { mktBtnPrimaryLg, mktBtnSecondaryHeroLg } from '@/components/marketing/marketingSurfaces'

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

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
          : { duration: WIDTH_MS, ease: EASE }
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
              transition={{ duration: FADE_MS, ease: EASE }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </motion.span>
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

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        }

  return (
    <section
      ref={heroRef}
      data-hero
      data-hero-dark="false"
      className="relative flex min-h-svh w-full flex-col overflow-hidden text-[#1C1E26]"
    >
      <HeroAtmosphere />

      <motion.div
        style={{ y: reduce ? 0 : contentY }}
        className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col items-center justify-start px-5 pt-20 pb-12 text-center sm:px-8 sm:pt-28 sm:pb-20 lg:px-10 lg:pt-32 lg:pb-24"
      >
        <motion.div {...fade(0)} className="mt-4 w-full min-h-0 shrink-0 sm:mt-6">
          <HeroCaptureGrid />
        </motion.div>

        <div className="relative min-h-0 max-w-3xl shrink">
          <motion.h1
            {...fade(0.1)}
            className="text-center text-[2.125rem] font-semibold leading-[1.08] tracking-tight text-[#1C1E26] sm:text-6xl md:text-[4.5rem]"
          >
            <span className="inline-flex flex-nowrap items-baseline justify-center gap-x-[0.25em] whitespace-nowrap">
              <HeroRotatingWord paused={!!reduce} />
              <span>for the web.</span>
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.18)}
            className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-stone-600 sm:text-[1.05rem]"
          >
            Capture highlights, notes, and answers on any page—then search them anytime.
          </motion.p>

          <motion.div {...fade(0.26)} className="mt-7 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
            <Link href="/install" className={`w-full sm:w-auto ${mktBtnPrimaryLg}`}>
              Add to Chrome
            </Link>
            <SectionLink href="/#product" className={`w-full sm:w-auto ${mktBtnSecondaryHeroLg}`}>
              See how it works
            </SectionLink>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
