'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Lock, Users, Settings, Shield, Eye, BarChart3,
  Database, FileCheck, Key, Github, UserCheck, Languages, Package,
} from 'lucide-react'

/** Smooth vertical parallax on scroll — not used on Knowledge Suite / DarkCurveSection. */
function MarketingParallaxSection({
  className,
  children,
  yRange = [22, -22] as [number, number],
}: {
  className: string
  children: ReactNode
  yRange?: [number, number]
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], yRange)
  return (
    <section ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   1. DARK CURVE KINETIC SECTION
   ═══════════════════════════════════════════════════════════════════ */

const ORBIT_NODES =[
  // Ring 1 (Inner)
  { id: 'intercom', ring: 1, angle: 165, icon: IntercomLogo },
  { id: 'github',   ring: 1, angle: 215, icon: GithubLogo },
  { id: 'notion',   ring: 1, angle: 115, icon: NotionLogo },
  // Ring 2 (Middle)
  { id: 'slack',    ring: 2, angle: 185, icon: SlackLogo },
  { id: 'jira',     ring: 2, angle: 240, icon: JiraLogo },
  { id: 'asana',    ring: 2, angle: 135, icon: AsanaLogo },
  // Ring 3 (Outer)
  { id: 'linear',   ring: 3, angle: 205, icon: LinearLogo },
  { id: 'generic1', ring: 3, angle: 155, icon: GenericDotLogo },
]

// Custom Logo Components to match the reference
function IntercomLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect width="24" height="24" rx="12" fill="#0057FF" />
      <path d="M7 11v4 M10 9v8 M14 9v8 M17 11v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function GithubLogo() {
  return <Github className="w-5 h-5 text-white" fill="currentColor" />
}

function NotionLogo() {
  return (
    <div className="w-5 h-5 bg-white rounded-[4px] flex items-center justify-center">
      <span className="text-black text-[11px] font-bold font-serif leading-none">N</span>
    </div>
  )
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="5" y="10" width="4" height="4" rx="2" fill="#E01E5A" />
      <rect x="10" y="10" width="9" height="4" rx="2" fill="#36C5F0" />
      <rect x="10" y="5" width="4" height="4" rx="2" fill="#2EB67D" />
      <rect x="10" y="15" width="4" height="4" rx="2" fill="#ECB22E" />
    </svg>
  )
}

function JiraLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 2L2 12l10 10 10-10L12 2z" fill="#0052CC" />
      <path d="M12 2L2 12l10 10V2z" fill="#2684FF" />
    </svg>
  )
}

function AsanaLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="6" r="3" fill="#F06A6A" />
      <circle cx="6" cy="16" r="3" fill="#F06A6A" />
      <circle cx="18" cy="16" r="3" fill="#F06A6A" />
    </svg>
  )
}

function LinearLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
      <path d="M12 2v20 M2 12h20" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  )
}

function GenericDotLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="8" fill="#FFF" opacity="0.2" />
      <circle cx="12" cy="12" r="4" fill="#FFF" />
    </svg>
  )
}

function OrbitVisual() {
  const center = { x: 750, y: 400 }
  const radii =[220, 360, 500]

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1000x800 coordinate space for precise absolute positioning */}
      <div className="absolute top-1/2 right-0 w-[1000px] h-[800px] -translate-y-1/2">
        
        {/* SVG Orbits */}
        <svg className="absolute inset-0 w-full h-full">
          {radii.map((r, i) => (
            <circle
              key={`ring-${i}`}
              cx={center.x}
              cy={center.y}
              r={r}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
              fill="none"
            />
          ))}
          {/* Subtle center glow/dot */}
          <circle cx={center.x} cy={center.y} r="4" fill="rgba(255,255,255,0.1)" />
        </svg>

        {/* Floating Icons */}
        {ORBIT_NODES.map((node, i) => {
          const r = radii[node.ring - 1]
          const rad = (node.angle * Math.PI) / 180
          const x = Math.round(center.x + r * Math.cos(rad))
          const y = Math.round(center.y + r * Math.sin(rad))
          const Icon = node.icon

          return (
            <div
              key={node.id}
              className="absolute w-[44px] h-[44px] rounded-full bg-[#152A55] border border-white/10 backdrop-blur-md"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <motion.div
                className="flex h-full w-full items-center justify-center rounded-full"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Icon />
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DarkCurveSection() {
  return (
    <section className="relative bg-[#F5EDE3]">
      {/* 
        The dark container itself 
        Using padding to ensure content doesn't hit the curved masks 
      */}
      <div className="relative bg-[#0B1735] overflow-hidden">
        
        {/* Top Curve Mask (Cream color to match background above) */}
        <svg 
          viewBox="0 0 1440 120" 
          className="absolute top-0 left-0 w-full text-[#F5EDE3] z-10 pointer-events-none" 
          preserveAspectRatio="none" 
          style={{ height: '8vw', minHeight: '60px' }}
        >
          {/* Sweeps down in the middle to create a concave dark shape */}
          <path d="M0,0 L1440,0 L1440,20 C1000,120 400,120 0,20 Z" fill="currentColor" />
        </svg>

        {/* Bottom Curve Mask (Cream color to match background below) */}
        <svg 
          viewBox="0 0 1440 120" 
          className="absolute bottom-0 left-0 w-full text-[#FDFBF7] z-10 pointer-events-none" 
          preserveAspectRatio="none" 
          style={{ height: '8vw', minHeight: '60px' }}
        >
          {/* Sweeps up in the middle */}
          <path d="M0,120 L1440,120 L1440,100 C1000,0 400,0 0,100 Z" fill="currentColor" />
        </svg>

        <OrbitVisual />

        {/* Content Container */}
        <div className="relative z-20 max-w-[1200px] mx-auto px-6 py-40 md:py-56 flex flex-col justify-center min-h-[700px]">
          <div className="max-w-[480px]">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C48CB3] mb-5"
            >
              The Workspace
            </motion.p>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-[44px] font-medium tracking-tight text-white leading-[1.15] mb-6"
            >
              Capture anywhere,<br />find everything.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[15px] text-stone-300 leading-relaxed mb-6"
            >
              Every sticky, highlight, drawing, clip, and AI edit made with the Inline extension flows straight into a workspace you can actually search. No folders to set up, no tags to memorize.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-[15px] text-stone-300 leading-relaxed mb-10"
            >
              History tables, analytics, a spatial map, and a live knowledge graph turn scattered captures into something you can think with — per workspace, per page, per idea.
            </motion.p>
            
            <motion.a
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              href="/app/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-[15px] font-medium text-[#1C1E26] transition-colors hover:bg-stone-100"
            >
              Open your workspace
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   2. ASK AI SECTION
   ═══════════════════════════════════════════════════════════════════ */

function AskSection() {
  return (
    <MarketingParallaxSection
      className="relative z-1 -mt-[2px] pt-[calc(6rem+2px)] pb-24 px-6 bg-[#FDFBF7]"
      yRange={[28, -28]}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1C1E26] mb-2 leading-tight">
          What did you save about that, again?
        </h2>
        <p className="text-2xl md:text-3xl font-semibold leading-tight mb-12">
          <span className="text-blue-500">Ask</span>
          <span className="text-blue-500 text-lg align-super ml-0.5">✦</span>
          <span className="text-[#1C1E26]"> searches every note, highlight, and recap</span>
          <br />
          <span className="text-[#1C1E26]">across your workspace in seconds.</span>
        </p>

        <div className="bg-blue-100 rounded-3xl p-8 md:p-12">
          <div className="bg-white rounded-2xl border border-stone-200/50 overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <p className="text-sm text-stone-700">What did I save about suspension bridges?</p>
              <div className="flex items-center gap-4 mt-3">
                {['Workspace', 'Date range', 'Capture type'].map(f => (
                  <span key={f} className="text-[11px] text-stone-400 flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-stone-200 inline-block" />
                    {f}
                  </span>
                ))}
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-100 inline-flex items-center justify-center text-[8px]">✓</span>
                  Your captures only
                </span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-700 mb-3">Here&apos;s what you saved across 2 pages:</p>
              <ul className="text-sm text-stone-600 space-y-2">
                <li>- A sticky note reading &ldquo;Revisit suspension bridge math before the draft&rdquo;</li>
                <li>- An AI summary of the Wikipedia intro, shortened to one sentence</li>
                <li>- Three drawings — one arrow, one rectangle, one pen stroke — over the main diagram</li>
                <li>- A highlight on the phrase &ldquo;cable-stayed bridges rely on…&rdquo;</li>
                <li>- An auto-regenerated recap document in the Auto Recaps folder</li>
              </ul>
              <div className="flex items-center gap-4 mt-5">
                <div className="flex items-center gap-2">
                  {['⊡', '⇧', '⇩'].map(icon => (
                    <span key={icon} className="w-6 h-6 rounded border border-stone-200 flex items-center justify-center text-stone-400 text-xs">
                      {icon}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-stone-100">
                <span className="text-[11px] text-stone-400">2 sources</span>
                {['wikipedia.org/wiki/Bridge', 'Auto Recaps · Bridge'].map(src => (
                  <span key={src} className="text-[11px] text-stone-600 flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-stone-200 inline-block" />
                    {src}
                    <span className="text-emerald-500 text-[10px]">✓</span>
                  </span>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100">
                <p className="text-[11px] text-stone-400 mb-2">Follow-up questions</p>
                <div className="flex flex-wrap gap-2">
                  {['Draft a short summary from the highlights', "Show every drawing I've made on this page", 'Read the recap aloud'].map(q => (
                    <span key={q} className="text-[11px] text-stone-500 bg-stone-50 rounded-full px-3 py-1 border border-stone-200/50">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {(
            [
              {
                text: 'Grounded only in your own captures and recaps',
                Icon: FileCheck,
              },
              {
                text: 'Scoped per workspace so work and personal stay separate',
                Icon: UserCheck,
              },
              {
                text: 'Speaks aloud with ElevenLabs when you ask it to',
                Icon: Languages,
              },
              {
                text: 'Free tier includes every AI action, no credit card',
                Icon: Package,
              },
            ] as const
          ).map(({ text, Icon }) => (
            <div key={text} className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-2xl border border-stone-200/50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-stone-400" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Product promise (no fake attribution) */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-lg text-stone-700 leading-relaxed">
            Ask only sees what you&apos;ve captured. No external training, no shared context —
            the answers are <span className="text-blue-500 font-medium">your own notes</span>,
            rearranged for the question in front of you.
          </p>
        </div>
      </div>
    </MarketingParallaxSection>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   3. ENTERPRISE BENTO GRID
   ═══════════════════════════════════════════════════════════════════ */

const BENTO_CARDS =[
  { icon: FileCheck, title: 'Sticky & paper notes',  body: 'Drop a sticky anywhere with Alt+S, or open a paper note panel for longer writing. Both anchor to the page and persist across reloads.',                      badge: 'Capture',      badgeColor: 'bg-yellow-100 text-yellow-700' },
  { icon: Eye,       title: 'Color highlights',      body: 'Highlight selections in your color of choice. Selections stay anchored even if the page reflows, and show up instantly in History.',                         badge: 'Capture',      badgeColor: 'bg-yellow-100 text-yellow-700' },
  { icon: Settings,  title: 'Drawings with auto-shapes', body: 'Pen, marker, arrow, rectangle, and ellipse tools. Rough strokes are auto-recognized and promoted to clean geometry.',                                       badge: 'Capture',      badgeColor: 'bg-yellow-100 text-yellow-700' },
  { icon: Key,       title: 'Stamps, anchors & handwriting', body: 'Drop emoji stamps, anchor notes to a specific selection, or write freehand — everything is replayed exactly where you left it.',                      badge: 'Capture',      badgeColor: 'bg-yellow-100 text-yellow-700' },
  { icon: Shield,    title: 'AI rephrase & shorten',  body: 'Highlight anything and ask for a rephrase, shorter version, or summary. Inserted output stays color-coded so you can always see what changed.',             badge: 'AI',           badgeColor: 'bg-pink-100 text-pink-700'     },
  { icon: Lock,      title: 'AI rewrite with your tone', body: 'Rewrite with a tone preset or a custom instruction. Diff view shows what moved, so nothing is smuggled into your sentences.',                             badge: 'AI',           badgeColor: 'bg-pink-100 text-pink-700'     },
  { icon: Users,     title: 'Ask your workspace',     body: 'Ask natural-language questions grounded only in the pages and notes you&apos;ve captured. Results come with citations to the source page.',                  badge: 'AI',           badgeColor: 'bg-pink-100 text-pink-700'     },
  { icon: BarChart3, title: 'Analytics & Graph',      body: 'See every capture roll up into charts, a spatial map, and a live knowledge graph linking notes to pages, tags, and ideas.',                                  badge: 'Workspace',    badgeColor: 'bg-stone-100 text-stone-600'   },
  { icon: Database,  title: 'Auto page recaps',       body: 'Every page you annotate earns a clean recap document — grouped by type, ordered by time, and regenerated when anything new lands.',                         badge: 'Workspace',    badgeColor: 'bg-stone-100 text-stone-600'   },
  { icon: Shield,    title: 'Screen reader on demand', body: 'Select text, press Alt+Shift+S, and an ElevenLabs voice reads it back. Never auto-triggers — your highlighter stays a highlighter.',                        badge: 'Accessibility',badgeColor: 'bg-green-100 text-green-700'   },
  { icon: Users,     title: 'Per-workspace isolation', body: 'Personal, research, and team captures stay in separate workspaces. Ask, History, and Graph scope themselves to whichever one you&apos;re in.',              badge: 'Privacy',      badgeColor: 'bg-stone-100 text-stone-600'   },
  { icon: FileCheck, title: 'Library with Tiptap',    body: 'Promote any capture into a rich-text document. Organize them into folders that live in your sidebar, right next to the Auto Recaps.',                       badge: 'Workspace',    badgeColor: 'bg-stone-100 text-stone-600'   },
  { icon: Key,       title: 'Works on any page',      body: 'The extension is a floating pill that slides out only when you need it. No content script fights, no page modifications unless you ask for them.',          badge: 'Extension',    badgeColor: 'bg-yellow-100 text-yellow-700' },
]

function WaveDivider({ from, to, flip = false }: { from: string; to: string, flip?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 160, backgroundColor: from }}>
      <svg
        viewBox="0 0 1440 160"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
        style={flip ? { transform: 'scaleX(-1)' } : {}}
      >
        <path
         d="M0,110 
   C320,80 820,140 1440,120 
   L1440,160 
   L0,160 
   Z"
          fill={to}
        />
      </svg>
    </div>
  )
}

function EnterpriseBentoGrid() {
  return (
    <MarketingParallaxSection className="py-24 px-6 bg-[#F5EDE3]" yRange={[20, -20]}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1C1E26] mb-4">
            Every pill button, every panel
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
            The Inline extension packs a lot into a single floating pill. Here&apos;s what lives
            behind each icon — from sticky notes and shape-aware drawings to AI rewrites,
            on-demand screen reading, and workspace-grounded Ask.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BENTO_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="bg-white rounded-2xl p-6 border border-stone-200/50 relative"
              >
                <div className="flex justify-end mb-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className="w-4 h-4 text-stone-600 shrink-0" />
                  <h3 className="text-sm font-semibold text-[#1C1E26]">{card.title}</h3>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">{card.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </MarketingParallaxSection>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   4. TESTIMONIALS — "Trusted by teams like yours"
   ═══════════════════════════════════════════════════════════════════ */

const TESTIMONIALS =[
  {
    stat: '11',
    statLabel: 'capture tools in the pill',
    type: 'stat' as const,
  },
  {
    quote: "Your annotations don't live on the page — they live in a workspace. Reload the tab, open a different device, or come back next week and everything is exactly where you left it.",
    type: 'quote' as const,
  },
  {
    quote: 'Rough strokes become clean shapes automatically. Draw a wobbly rectangle, lift the pen, and Inline straightens it into crisp geometry without you touching a thing.',
    type: 'quote' as const,
  },
  {
    stat: '0 ms',
    statLabel: 'unsolicited screen reader triggers',
    type: 'stat' as const,
  },
  {
    quote: "Ask is grounded in your own captures — no external training, no invented context. Every answer cites the page and capture it came from.",
    type: 'quote' as const,
  },
  {
    quote: 'Every page you annotate earns a clean recap document in an Auto Recaps folder, regenerated whenever anything new lands. It looks, opens, and edits like any other doc.',
    type: 'quote' as const,
  },
  {
    stat: '1 click',
    statLabel: 'to promote a capture to a doc',
    type: 'stat' as const,
  },
]

/** 3×3 bento: row1 [stat | quote span2], row2 [quote | stat | quote], row3 [quote span2 | stat] */
const TESTIMONIAL_MD_GRID = [
  'md:col-start-1 md:row-start-1',
  'md:col-start-2 md:col-span-2 md:row-start-1',
  'md:col-start-1 md:row-start-2',
  'md:col-start-2 md:row-start-2',
  'md:col-start-3 md:row-start-2',
  'md:col-start-1 md:col-span-2 md:row-start-3',
  'md:col-start-3 md:row-start-3',
] as const

/** Stat tiles white; quote tiles #FAF5EE on section bg #FDFBF7 */
const TESTIMONIAL_CARD_SURFACE = [
  'bg-white border-stone-200/50',
  'bg-[#FAF5EE] border-stone-200/55',
  'bg-[#FAF5EE] border-stone-200/55',
  'bg-white border-stone-200/50',
  'bg-[#FAF5EE] border-stone-200/55',
  'bg-[#FAF5EE] border-stone-200/55',
  'bg-white border-stone-200/50',
] as const

const USE_CASES =[
  { title: 'The deep-read workflow', subtitle: 'Paper notes · AI summaries · Auto recaps',                body: 'Highlight the parts that matter, drop paper notes in the margins, and ask Inline to summarize.', color: 'bg-[#6C91C2]' },
  { title: 'The sketch-and-ship workflow', subtitle: 'Drawings · Stamps · Rewrite', body: 'Mark up mockups with shape-aware drawings and rewrite copy in place without losing your selection.',               color: 'bg-[#EBBAC7]' },
  { title: 'The research workflow', subtitle: 'History · Graph · Map',                body: 'Let captures pile up across dozens of tabs, then explore them in History, the Graph, or the spatial Map.',               color: 'bg-[#C4D7D1]' },
]

function TestimonialsSection() {
  return (
    <MarketingParallaxSection className="py-24 px-6 bg-[#FDFBF7]" yRange={[24, -24]}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1C1E26] text-center mb-4">
          Built around a few simple promises
        </h2>
        <p className="text-stone-500 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Inline is young and opinionated. These are the things we refuse to get wrong,
          and the ones we think make the difference between a notebook and a web annotator.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 mb-16 auto-rows-fr">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className={`rounded-2xl border p-6 flex flex-col justify-center ${TESTIMONIAL_CARD_SURFACE[i] ?? 'bg-white border-stone-200/50'} ${TESTIMONIAL_MD_GRID[i] ?? ''}`}
            >
              {item.type === 'stat' ? (
                <div className="text-center py-4">
                  <p className="text-3xl md:text-4xl font-semibold text-[#1C1E26] mb-1">{item.stat}</p>
                  <p className="text-sm text-stone-400">{item.statLabel}</p>
                </div>
              ) : (
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.quote}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Use cases (real product workflows, no fake attribution) */}
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1C1E26] text-center mb-10">
          Three ways people use Inline
        </h3>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {USE_CASES.map(uc => {
            const initial = uc.title.replace(/^the\s+/i, '').charAt(0).toUpperCase()
            return (
              <div key={uc.title} className="bg-white rounded-2xl border border-stone-200/50 p-6 flex flex-col">
                <div className={`w-10 h-10 rounded-xl ${uc.color} mb-4 flex items-center justify-center`}>
                  <span className="text-white font-semibold text-sm">{initial}</span>
                </div>
                <p className="text-sm font-semibold text-[#1C1E26] mb-1">{uc.title}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium mb-3">{uc.subtitle}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{uc.body}</p>
              </div>
            )
          })}
        </div>

        {/* Closing CTA — honest, concrete */}
        <div className="mt-24 grid md:grid-cols-2 gap-16 items-center bg-[#FAF5EE] rounded-3xl p-10 md:p-16">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold text-[#1C1E26] mb-6">
              Two minutes to get going
            </h3>
            <ul className="space-y-3">
              {[
                'Install the Inline Chrome extension',
                'Sign in to your workspace at app.inline.dev',
                'Highlight something, drop a sticky, sketch an arrow',
                'Ask the AI to summarize, rephrase, or read it aloud',
                'Watch the recap for that page appear in your library',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-stone-600">
                  <span className="text-blue-400 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-8">
              <a href="#install" className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-transparent px-6 py-2.5 text-sm font-medium text-stone-800 hover:border-stone-400 hover:bg-white transition-colors">
                Install the extension
              </a>
              <a href="/app/dashboard" className="inline-flex items-center justify-center rounded-full bg-[#1C1E26] px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors">
                Open your workspace
              </a>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Works on any site',          body: 'The pill lives in the corner of every tab. No per-site config, no content takeover — it only appears when you ask for it.' },
              { title: 'Your captures are yours',    body: 'Captures live in your Supabase workspace under RLS. No analytics trackers on the extension, no sneaky background scraping.' },
              { title: 'Keyboard-first by design',   body: 'Alt+S for a sticky, Alt+H to highlight, Alt+D to draw, Alt+Shift+S to read aloud. Every action has a shortcut.' },
            ].map(t => (
              <div key={t.title} className="bg-white rounded-2xl border border-stone-200/50 p-5">
                <p className="text-xs font-semibold text-[#1C1E26] mb-1">{t.title}</p>
                <p className="text-sm text-stone-600 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarketingParallaxSection>
  )
}

/* ─── Combined Export ─── */

export default function FeatureSection() {
  return (
    <>
      <DarkCurveSection />
      <AskSection />
      <WaveDivider from="#FDFBF7" to="#F5EDE3" />
      <EnterpriseBentoGrid />
      <WaveDivider from="#F5EDE3" to="#FDFBF7" flip />
      <TestimonialsSection />
    </>
  )
}