'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
})

/** Sweeping dashed arc with a paper airplane at the end — decorative background element. */
function DashedFlightPath() {
  const pathD =
    'M -100 400 C 120 300, 260 140, 420 100 C 620 60, 780 140, 980 300'

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible hidden sm:block"
      aria-hidden
    >
      <svg
        viewBox="0 0 900 560"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <motion.path
          d={pathD}
          stroke="#B5CDEF"
          strokeOpacity="0.55"
          strokeWidth="1.75"
          strokeDasharray="8 8"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.4, ease: 'easeOut' }}
        />
        <motion.g
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 2.2, ease: EASE }}
        >
          <g transform="translate(980,300) rotate(-20)">
            <path d="M 0 0 L -22 -8 L -6 -2 L -18 6 Z" fill="#B5CDEF" fillOpacity="0.8" />
            <line x1="-6" y1="-2" x2="-13" y2="2" stroke="#B5CDEF" strokeOpacity="0.6" strokeWidth="0.9" />
          </g>
        </motion.g>
      </svg>
    </div>
  )
}

/** Small sparkle / 4-point star used as a decorative accent. */
function Sparkle({ size = 10, className = '', delay = 0 }: { size?: number; className?: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 10 10"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      aria-hidden
    >
      <path
        d="M5 0 L5.9 4.1 L10 5 L5.9 5.9 L5 10 L4.1 5.9 L0 5 L4.1 4.1 Z"
        fill="#C9DAF0"
      />
    </motion.svg>
  )
}

/** Pastel blue decorative layer sitting above the navy background.
 *  Constellation dots, concentric dashed rings, a soft counter-arc, and a
 *  handful of sparkles. All tuned at low opacity so the hero stays calm. */
function PastelAccents() {
  // Pre-computed dot constellation — stable between renders so there's no
  // hydration drift. Values are in viewBox units (0-1000 x, 0-700 y).
  const DOTS = [
    { x:  80, y: 120, r: 1.6, o: 0.35 },
    { x: 180, y:  70, r: 1.2, o: 0.25 },
    { x:  40, y: 260, r: 1.8, o: 0.45 },
    { x: 140, y: 380, r: 1.2, o: 0.3  },
    { x: 260, y: 200, r: 1.4, o: 0.3  },
    { x: 870, y:  90, r: 1.6, o: 0.4  },
    { x: 930, y: 190, r: 1.2, o: 0.3  },
    { x: 780, y: 140, r: 1.4, o: 0.3  },
    { x: 950, y: 340, r: 1.8, o: 0.4  },
    { x: 820, y: 440, r: 1.2, o: 0.25 },
    { x: 700, y: 520, r: 1.4, o: 0.25 },
    { x: 100, y: 560, r: 1.6, o: 0.3  },
    { x: 300, y: 600, r: 1.2, o: 0.2  },
  ] as const

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        {/* Concentric dashed rings, upper left — solar-system vibe */}
        <g transform="translate(-40 -40)" opacity="0.9">
          <circle cx="180" cy="180" r="220" stroke="#8AACDB" strokeOpacity="0.28" strokeWidth="1.25" strokeDasharray="4 8" fill="none" />
          <circle cx="180" cy="180" r="160" stroke="#8AACDB" strokeOpacity="0.32" strokeWidth="1.25" strokeDasharray="4 8" fill="none" />
          <circle cx="180" cy="180" r="100" stroke="#8AACDB" strokeOpacity="0.38" strokeWidth="1.25" strokeDasharray="4 8" fill="none" />
        </g>

        {/* Gentle counter-arc sweeping the other way, lower right */}
        <motion.path
          d="M 1100 540 C 900 620, 700 620, 500 560 C 360 520, 220 460, 80 420"
          stroke="#B5CDEF"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeDasharray="3 9"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, delay: 0.9, ease: 'easeOut' }}
        />

        {/* Open rings scattered as "satellites" */}
        <g opacity="0.8">
          <circle cx="880" cy="260" r="18" stroke="#B5CDEF" strokeOpacity="0.5" strokeWidth="1.25" fill="none" />
          <circle cx="880" cy="260" r="5"  fill="#B5CDEF" fillOpacity="0.7" />
        </g>
        <g opacity="0.75">
          <circle cx="130" cy="480" r="14" stroke="#B5CDEF" strokeOpacity="0.45" strokeWidth="1.25" fill="none" />
          <circle cx="130" cy="480" r="4"  fill="#B5CDEF" fillOpacity="0.65" />
        </g>

        {/* Constellation dots */}
        {DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r * 1.6}
            fill="#B5CDEF"
            fillOpacity={Math.min(1, d.o + 0.25)}
          />
        ))}
      </svg>

      {/* A few sparkles layered in DOM so they can animate on entry */}
      <Sparkle size={24} delay={0.9}  className="absolute top-[18%] left-[8%]" />
      <Sparkle size={18} delay={1.1}  className="absolute top-[30%] right-[14%]" />
      <Sparkle size={14} delay={1.35} className="absolute top-[58%] left-[20%]" />
      <Sparkle size={22} delay={1.55} className="absolute top-[70%] right-[22%]" />
      <Sparkle size={16} delay={1.75} className="absolute top-[46%] right-[6%]" />
      <Sparkle size={12} delay={1.95} className="absolute top-[12%] right-[30%]" />
      <Sparkle size={14} delay={2.1}  className="absolute top-[82%] left-[42%]" />
    </div>
  )
}

/** Mini sidebar item used inside the hero mockup. */
function SidebarItem({ label, active = false, dotClass = 'bg-stone-200' }: { label: string; active?: boolean; dotClass?: string }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${active ? 'bg-[#EBF1F7] text-[#1C1E26] font-medium' : 'text-stone-500'}`}>
      <span className={`w-2.5 h-2.5 rounded-[3px] ${active ? 'bg-[#6C91C2]' : dotClass}`} />
      <span className="truncate">{label}</span>
    </div>
  )
}

/** Browser-framed preview of a real Inline workspace (History view). */
function BrowserMockup() {
  return (
    <div className="relative rounded-3xl border border-white/15 p-2.5 md:p-3 bg-[#FDFBF7]/95 ring-1 ring-white/5">
      <div className="bg-white rounded-2xl border border-stone-200/50 overflow-hidden">
        <div className="relative flex items-center px-5 py-3 border-b border-stone-100">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[calc(100%-5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex justify-center">
            <div className="bg-stone-50 rounded-md px-4 py-1.5 text-xs text-stone-400 font-mono text-center truncate">
              app.inline.dev/ws-personal/history
            </div>
          </div>
        </div>

        <div className="flex min-h-[600px] md:min-h-[700px]">
          {/* Workspace sidebar mirroring the real app */}
          <div className="w-52 border-r border-stone-100 p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-md bg-[#1C1E26] flex items-center justify-center text-white text-[10px] font-semibold">I</div>
              <span className="text-xs font-semibold text-stone-700">inline</span>
            </div>

            <div className="space-y-0.5">
              <SidebarItem label="Search" />
              <SidebarItem label="Ask" />
            </div>

            <div className="mt-5 mb-2 text-[10px] font-medium uppercase tracking-widest text-stone-400">
              Features
            </div>
            <div className="space-y-0.5">
              <SidebarItem label="Dashboard" />
              <SidebarItem label="History" active />
              <SidebarItem label="Analytics" />
              <SidebarItem label="Workflows" />
              <SidebarItem label="Map" />
              <SidebarItem label="Graph" />
              <SidebarItem label="Settings" />
            </div>

            <div className="mt-5 mb-2 text-[10px] font-medium uppercase tracking-widest text-stone-400">
              Workspaces
            </div>
            <div className="space-y-0.5">
              <SidebarItem label="Personal" dotClass="bg-[#EBBAC7]" />
              <SidebarItem label="Research" dotClass="bg-[#C4D7D1]" />
              <SidebarItem label="Reading list" dotClass="bg-[#F5EDE3]" />
            </div>
          </div>

          {/* Main content: Activity-by-page + notes table */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-4">
              <span>Research & Insights</span>
              <span>/</span>
              <span className="text-stone-600 font-medium">History</span>
            </div>

            {/* Activity-by-page card */}
            <div className="rounded-2xl border border-stone-200 bg-[#FDFBF7] p-5 mb-6">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-stone-200 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">en.wikipedia.org/wiki/Bridge</p>
                  <p className="text-xs text-stone-400">Last activity 4 minutes ago</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['3 drawings', '2 highlights', '1 AI summary', '1 sticky'].map(t => (
                  <span key={t} className="text-[10px] text-stone-600 bg-white border border-stone-200 rounded-full px-2 py-0.5">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="text-[10px] text-stone-400 italic">Auto-regenerating recap…</span>
                <span className="text-[11px] font-medium text-[#4B83C4]">View recap document →</span>
              </div>
            </div>

            {/* Notes table */}
            <div className="rounded-2xl border border-stone-200 overflow-hidden">
              <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-50 border-b border-stone-200">
                <span>Preview</span>
                <span>Type</span>
                <span>Captured</span>
              </div>
              {[
                { preview: 'AI shorten: A bridge must be strong enough to…', type: 'AI Summary', typeClass: 'bg-emerald-50 text-emerald-700', when: '4m ago', barClass: 'bg-amber-300' },
                { preview: 'Drawing — Arrow · 18 points', type: 'Drawing', typeClass: 'bg-violet-50 text-violet-700', when: '5m ago', barClass: 'bg-stone-700' },
                { preview: 'Drawing — Rectangle · 12 points', type: 'Drawing', typeClass: 'bg-violet-50 text-violet-700', when: '5m ago', barClass: 'bg-stone-700' },
                { preview: 'Sticky note: Revisit suspension bridge math', type: 'Text', typeClass: 'bg-stone-100 text-stone-700', when: '6m ago', barClass: 'bg-[#EBBAC7]' },
                { preview: 'Highlight: "cable-stayed bridges rely on…"', type: 'Text', typeClass: 'bg-[#FEF3C7] text-amber-800', when: '7m ago', barClass: 'bg-amber-300' },
              ].map((r, i) => (
                <div key={i} className={`grid grid-cols-[1.4fr_0.6fr_0.7fr] items-center px-4 py-3 ${i === 4 ? '' : 'border-b border-stone-100'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-1 h-8 rounded-full ${r.barClass}`} />
                    <span className="text-xs text-stone-700 truncate">{r.preview}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full justify-self-start ${r.typeClass}`}>{r.type}</span>
                  <span className="text-[10px] text-stone-400">{r.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating feature cards — product-accurate, no fake testimonials */}
      <div className="hidden md:block absolute bottom-36 -left-4 lg:-left-15 bg-white rounded-2xl border border-stone-200/50 p-4 max-w-xs z-1 shadow-lg shadow-[#0B1735]/25">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1C1E26] bg-[#FEF3C7] rounded-full px-2 py-0.5">Sticky note</span>
          <span className="text-[10px] text-stone-400">en.wikipedia.org</span>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          Revisit suspension bridge math before the draft.
        </p>
        <p className="text-[10px] text-stone-400 mt-2">Press <kbd className="font-mono bg-stone-100 px-1 rounded">Alt</kbd>+<kbd className="font-mono bg-stone-100 px-1 rounded">S</kbd> on any page.</p>
      </div>
      <div className="hidden md:block absolute bottom-24 lg:bottom-1/2 right-5 lg:-right-15 bg-white rounded-2xl border border-stone-200/50 p-4 max-w-xs z-1 shadow-lg shadow-[#0B1735]/25">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">AI shorten</span>
          <span className="text-[10px] text-stone-400">just now</span>
        </div>
        <mark className="text-sm text-stone-700 leading-relaxed bg-emerald-100/60 border-b-2 border-emerald-300 rounded px-1 py-0.5" style={{ color: '#1C1E26' }}>
          Bridges must be strong enough to carry their load.
        </mark>
        <p className="text-[10px] text-stone-400 mt-2">Hover to see which action was applied.</p>
      </div>
    </div>
  )
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const mockupParallaxY = useTransform(scrollYProgress, [0, 1], [0, 72])

  return (
    <section ref={heroRef} data-hero className="relative bg-[#0B1735] w-full overflow-hidden">
      <PastelAccents />
      <DashedFlightPath />
      <div className="relative z-1 max-w-5xl mx-auto px-6 lg:px-10 pt-36 md:pt-44 pb-8 text-center">

        {/* Top pill badge */}
        <motion.div {...fade(0)} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-stone-200 backdrop-blur-sm">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-400 px-2 py-0.5 text-[10px] font-semibold text-[#0B1735] uppercase tracking-wide">
              New
            </span>
            Your notes, right where you need them.
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fade(0.06)} className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
          Your thoughts, <br />
          deserve a home.
        </motion.h1>

        {/* Subtext */}
        <motion.p {...fade(0.12)} className="text-lg text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Save notes, highlight anything, and collaborate with your team —
          right on top of any website. Powered by AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fade(0.18)} className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-7 py-3 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            Open your workspace
          </Link>
          <Link
            href="#install"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-medium text-[#0B1735] transition-colors hover:bg-stone-100"
          >
            Install the extension
          </Link>
        </motion.div>
      </div>

      {/* Browser Mockup — entrance + smooth scroll parallax */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
        className="max-w-6xl mx-auto px-6 lg:px-10 pb-24 md:pb-32 relative"
      >
        <motion.div style={{ y: mockupParallaxY }} className="will-change-transform">
          <BrowserMockup />
        </motion.div>
      </motion.div>

      {/* Curved transition into the cream capability strip below — mirrors the
          WaveDivider that lives under SocialProofStrip so the section edges
          echo each other. */}
      <div className="relative w-full overflow-hidden" style={{ height: 160 }} aria-hidden>
        <svg
          viewBox="0 0 1440 160"
          className="absolute bottom-0 left-0 w-full block"
          preserveAspectRatio="none"
          style={{ height: 160 }}
        >
          <path
            d="M0,0 
               C360,120 1080,120 1440,0 
               L1440,200 
               L0,200 
               Z"
            fill="#FDFBF7"
          />
        </svg>
      </div>
    </section>
  )
}
