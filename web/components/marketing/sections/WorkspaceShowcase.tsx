'use client'

import Link from 'next/link'
import {
  History,
  MessageSquareText,
  Library,
  BarChart3,
  Map,
  Share2,
  FileText,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Reveal } from '@/components/marketing/primitives/Reveal'

/**
 * #workspace — modelled on the Attio/Slite "Ask beyond … across all your
 * tools" section: a dark band with cream curved transitions top and bottom,
 * a left-aligned headline + CTA, and the eight real workspace surfaces
 * orbiting on dashed rings to the right.
 */

type Orbit = {
  icon: LucideIcon
  title: string
  /** position within the 520×460 orbital stage (px) */
  x: number
  y: number
  /** tile size */
  size?: number
  accent?: boolean
}

const ORBITS: Orbit[] = [
  { icon: MessageSquareText, title: 'Ask Inline', x: 250, y: 70, size: 56, accent: true },
  { icon: LayoutDashboard, title: 'Dashboard', x: 410, y: 120, size: 50 },
  { icon: Library, title: 'Library', x: 150, y: 175, size: 48 },
  { icon: History, title: 'History', x: 330, y: 215, size: 52 },
  { icon: BarChart3, title: 'Analytics', x: 470, y: 250, size: 46 },
  { icon: Map, title: 'Map', x: 235, y: 300, size: 48 },
  { icon: Share2, title: 'Graph', x: 388, y: 350, size: 50 },
  { icon: FileText, title: 'Auto-recaps', x: 110, y: 360, size: 44 },
]

/** Dashed concentric orbit rings centred toward the right of the stage. */
function OrbitRings() {
  return (
    <svg
      viewBox="0 0 520 460"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="ws-orbit-glow" cx="62%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#8B6FE0" stopOpacity="0.20" />
          <stop offset="45%" stopColor="#5566C9" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0B1735" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="520" height="460" fill="url(#ws-orbit-glow)" />
      {[210, 152, 96].map((r, i) => (
        <ellipse
          key={r}
          cx="300"
          cy="225"
          rx={r}
          ry={r * 0.92}
          stroke="#9FB3D9"
          strokeOpacity={0.16 + i * 0.04}
          strokeWidth="1"
          strokeDasharray="2 9"
        />
      ))}
      {/* small node accent on the inner ring */}
      <circle cx="396" cy="225" r="3.5" fill="#B5CDEF" fillOpacity="0.7" />
      <circle cx="300" cy="33" r="2.5" fill="#B5CDEF" fillOpacity="0.5" />
    </svg>
  )
}

function OrbitTile({ orbit, index }: { orbit: Orbit; index: number }) {
  const reduce = useReducedMotion()
  const size = orbit.size ?? 48
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(orbit.x / 520) * 100}%`, top: `${(orbit.y / 460) * 100}%` }}
      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className={`group flex items-center justify-center rounded-2xl border backdrop-blur-sm transition-colors ${
          orbit.accent
            ? 'border-white/20 bg-linear-to-br from-[#5b4bb8] to-[#1a2547]'
            : 'border-white/12 bg-white/6 hover:bg-white/10'
        }`}
        style={{
          width: size,
          height: size,
          boxShadow: orbit.accent
            ? '0 10px 30px -8px rgba(139,111,224,0.45)'
            : '0 6px 18px -8px rgba(0,0,0,0.5)',
        }}
        title={orbit.title}
      >
        <orbit.icon
          className={orbit.accent ? 'text-white' : 'text-[#B5CDEF]'}
          style={{ width: size * 0.4, height: size * 0.4 }}
          aria-hidden
        />
      </motion.div>
    </motion.div>
  )
}

export default function WorkspaceShowcase() {
  return (
    <section
      id="workspace"
      className="relative scroll-mt-24 overflow-hidden bg-[#0B1735] py-28 md:py-36"
    >
      {/* ── Top curve: white (ExtensionShowcase) dipping down into the dark ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden" style={{ height: 120 }} aria-hidden>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block w-full" style={{ height: 120 }}>
          <path d="M0,0 L1440,0 L1440,46 C1020,112 420,112 0,46 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* ── Bottom curve: cream (RagSection) rising up into the dark ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden" style={{ height: 120 }} aria-hidden>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute bottom-0 block w-full" style={{ height: 120 }}>
          <path d="M0,120 L0,74 C420,10 1020,10 1440,74 L1440,120 Z" fill="#FDFBF7" />
        </svg>
      </div>

      {/* faint ambient glow */}
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[460px] w-[460px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(123,103,210,0.16) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative z-20 mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-8 lg:px-10">
        {/* Left: copy + CTA */}
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#9D8BE6]">
            The workspace
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-[3.25rem]">
            Everything you capture,
            <br className="hidden sm:block" /> across all your tools
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-stone-300/90">
            Highlights, notes, rewrites, and recaps stay attached to the page — then
            roll up into one workspace you can search, chart, map, and ask.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-stone-400">
            Every surface below is a real page in the app — connected, searchable, and
            grounded in the context you saved.
          </p>
          <Link
            href="/app/dashboard"
            className="mt-9 inline-flex items-center justify-center rounded-full border border-white/25 bg-white/4 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          >
            Open your workspace
          </Link>
        </Reveal>

        {/* Right: orbital surfaces */}
        <div className="relative mx-auto aspect-520/460 w-full max-w-[520px]">
          <OrbitRings />
          {ORBITS.map((o, i) => (
            <OrbitTile key={o.title} orbit={o} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
