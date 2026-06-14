'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

/** Small sparkle / 4-point star used as a decorative accent. */
function Sparkle({ size = 10, className = '', delay = 0 }: { size?: number; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <svg viewBox="0 0 10 10" width={size} height={size} className={className} aria-hidden>
        <path d="M5 0 L5.9 4.1 L10 5 L5.9 5.9 L5 10 L4.1 5.9 L0 5 L4.1 4.1 Z" fill="#C9DAF0" />
      </svg>
    )
  }
  return (
    <motion.svg
      viewBox="0 0 10 10"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0.7, 1], scale: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      aria-hidden
    >
      <path d="M5 0 L5.9 4.1 L10 5 L5.9 5.9 L5 10 L4.1 5.9 L0 5 L4.1 4.1 Z" fill="#C9DAF0" />
    </motion.svg>
  )
}

/** Quiet starfield — fixed dot positions (no hydration drift), low opacity. */
function Starfield() {
  const STARS = [
    { x: 6, y: 14, r: 1.4, o: 0.5 }, { x: 14, y: 32, r: 1, o: 0.35 },
    { x: 22, y: 9, r: 1.2, o: 0.4 }, { x: 31, y: 24, r: 0.9, o: 0.3 },
    { x: 9, y: 52, r: 1, o: 0.3 }, { x: 18, y: 68, r: 1.3, o: 0.35 },
    { x: 40, y: 12, r: 1, o: 0.3 }, { x: 48, y: 30, r: 0.8, o: 0.25 },
    { x: 60, y: 10, r: 1.3, o: 0.45 }, { x: 69, y: 26, r: 1, o: 0.32 },
    { x: 78, y: 14, r: 1.2, o: 0.4 }, { x: 86, y: 33, r: 1, o: 0.3 },
    { x: 92, y: 18, r: 1.4, o: 0.5 }, { x: 83, y: 56, r: 1, o: 0.32 },
    { x: 94, y: 62, r: 1.2, o: 0.35 }, { x: 72, y: 64, r: 0.9, o: 0.28 },
    { x: 55, y: 20, r: 0.8, o: 0.24 }, { x: 36, y: 60, r: 1, o: 0.3 },
  ] as const
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.18} fill="#DCE8FA" fillOpacity={s.o} />
        ))}
      </svg>
    </div>
  )
}

/** Faint concentric orbital rings drifting in the upper field. */
function Orbits() {
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g transform="translate(120 90)" opacity="0.55">
          <circle cx="0" cy="0" r="240" stroke="#8AACDB" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 10" fill="none" />
          <circle cx="0" cy="0" r="170" stroke="#8AACDB" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 10" fill="none" />
          <circle cx="0" cy="0" r="100" stroke="#8AACDB" strokeOpacity="0.26" strokeWidth="1" strokeDasharray="3 10" fill="none" />
        </g>
        <motion.path
          d="M 1080 250 C 880 360, 620 380, 360 320"
          stroke="#B5CDEF" strokeOpacity="0.28" strokeWidth="1.25" strokeDasharray="2 11" fill="none"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, delay: 0.7, ease: 'easeOut' }}
        />
        <g opacity="0.7">
          <circle cx="855" cy="150" r="16" stroke="#B5CDEF" strokeOpacity="0.45" strokeWidth="1.1" fill="none" />
          <circle cx="855" cy="150" r="4" fill="#B5CDEF" fillOpacity="0.6" />
        </g>
      </svg>
    </div>
  )
}

/** The cinematic centerpiece — a large planetary body rising from the bottom.
 *  Restrained navy sphere, soft blue rim light along the lit limb, faint
 *  surface banding, and an atmospheric glow. No neon, no harsh gradients;
 *  depth is built from low-opacity layers. */
function Planet({ y }: { y: MotionValue<number> | number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      style={{ y }}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[64vh] overflow-hidden"
      aria-hidden
    >
      {/* Atmospheric glow off the planet's crown */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
        className="absolute left-1/2 bottom-[8vh] h-[140%] w-[170%] -translate-x-1/2 rounded-[100%]"
        style={{
          background:
            'radial-gradient(closest-side at 50% 100%, rgba(126,162,222,0.28) 0%, rgba(110,145,200,0.12) 42%, rgba(110,145,200,0.04) 66%, transparent 82%)',
        }}
      />

      {/* The planet — wider than the viewport, mostly below the fold */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 44 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.7, delay: 0.35, ease: EASE }}
        className="absolute left-1/2 -translate-x-1/2 rounded-full bottom-[-92vw] h-[160vw] w-[160vw] sm:bottom-[-96vw] md:bottom-[-66vw] md:h-[124vw] md:w-[124vw]"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 7%, #20335C 0%, #16264C 28%, #0F1D3D 54%, #0A1430 100%)',
          boxShadow: 'inset 0 8px 44px rgba(181,205,239,0.16), inset 0 -48px 130px rgba(0,0,0,0.38)',
        }}
      >
        {/* Lit limb — crisp rim light along the top edge */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 5.5%, rgba(193,214,244,0.6) 0%, rgba(193,214,244,0.12) 3.6%, transparent 8%)',
          }}
        />
        {/* Faint surface banding */}
        <div
          className="absolute inset-0 rounded-full opacity-[0.05]"
          style={{ background: 'repeating-linear-gradient(177deg, transparent 0 40px, #B5CDEF 40px 41px)' }}
        />
      </motion.div>

      {/* Single hairline orbit arc sweeping above the planet */}
      <svg
        className="absolute left-1/2 bottom-[10vh] h-[80vw] w-[170vw] -translate-x-1/2 md:w-[124vw]"
        viewBox="0 0 1200 600" fill="none" preserveAspectRatio="xMidYMax meet"
      >
        <ellipse cx="600" cy="610" rx="560" ry="300" stroke="#B5CDEF" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 11" />
      </svg>
    </motion.div>
  )
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  // Subtle parallax: planet drifts down a touch, content lifts as you scroll.
  const planetY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40])

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        }

  return (
    <section
      ref={heroRef}
      data-hero
      className="relative flex min-h-svh w-full flex-col overflow-hidden bg-[#0B1735]"
    >
      {/* ── Background layers ── */}
      <Starfield />
      <Orbits />
      <Planet y={reduce ? 0 : planetY} />
      <Sparkle size={20} delay={0.9} className="absolute left-[10%] top-[20%]" />
      <Sparkle size={14} delay={1.1} className="absolute right-[14%] top-[26%]" />
      <Sparkle size={12} delay={1.35} className="absolute left-[22%] top-[60%]" />
      <Sparkle size={16} delay={1.55} className="absolute right-[10%] top-[52%]" />

      {/* ── Centered content ── */}
      <motion.div
        style={{ y: reduce ? 0 : contentY }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pt-28 pb-24 text-center lg:px-10"
      >
        {/* Quiet eyebrow — wordmark, not a marketing banner */}
        <motion.div {...fade(0)} className="mb-7 flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
            <span className="block h-3 w-[3px] -rotate-12 rounded-full bg-[#C9DAF0]" />
          </span>
          <span className="text-sm font-medium tracking-wide text-stone-300/80">Inline</span>
        </motion.div>

        {/* Headline — DM Sans, large and calm */}
        <motion.h1
          {...fade(0.08)}
          className="text-balance text-[2.85rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-[4.5rem]"
        >
          Your memory layer
          <br className="hidden sm:block" /> for the web.
        </motion.h1>

        {/* Subcopy — plain, non-technical */}
        <motion.p
          {...fade(0.16)}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-stone-300/90 sm:text-lg"
        >
          Highlight, write, summarize, and ask questions on any webpage. Inline saves the
          context into a workspace you can search later.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fade(0.24)} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/install"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0B1735] transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          >
            Add to Chrome
          </Link>
          <Link
            href="/#product"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-medium text-white transition-colors hover:border-white/55 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          >
            See how it works
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="relative z-10 mb-[clamp(28px,9vh,72px)] flex justify-center"
        aria-hidden
      >
        <span className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/25 p-1.5">
          <motion.span
            className="block h-1.5 w-1 rounded-full bg-white/70"
            animate={reduce ? undefined : { y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>

      {/* ── Curved capsule transition into the cream product section ──
           Flipped: the cream now dips down through the centre (a valley)
           rather than arching up, mirroring the Attio/Slite curve style. */}
      <div className="relative z-10 w-full overflow-hidden" style={{ height: 120 }} aria-hidden>
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 left-0 block w-full"
          preserveAspectRatio="none"
          style={{ height: 120 }}
        >
          <path d="M0,120 L0,48 C420,112 1020,112 1440,48 L1440,120 Z" fill="#FDFBF7" />
        </svg>
      </div>
    </section>
  )
}
