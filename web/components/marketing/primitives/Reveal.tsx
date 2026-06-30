'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { launch, launchEyebrow } from '@/components/marketing/marketingSurfaces'

export const MARKETING_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

/**
 * Scroll-reveal wrapper used across the landing page. Renders children
 * statically when the user prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = 'div',
  variant = 'default',
  product = false,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
  variant?: 'default' | 'launch'
  /** Launch variant only — deeper scale for product frames */
  product?: boolean
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const isLaunch = variant === 'launch'

  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  const initialScale = isLaunch && product ? 0.92 : isLaunch ? 0.97 : 1

  return (
    <Tag
      initial={{ opacity: 0, y: isLaunch ? 24 : y, scale: initialScale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: isLaunch ? launch.durationReveal : 0.55,
        delay,
        ease: isLaunch ? launch.ease : MARKETING_EASE,
      }}
      className={className}
    >
      {children}
    </Tag>
  )
}

/** Full-viewport launch beat — vertically centered content block */
export function LaunchBeat({
  children,
  className,
  product = false,
}: {
  children: ReactNode
  className?: string
  /** Taller beat for product reveal sections */
  product?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center',
        product ? 'min-h-[90svh]' : 'min-h-[85svh]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Consistent section heading block: eyebrow, title, optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'center',
  onDark = false,
  launchStyle = false,
}: {
  eyebrow: string
  title: string
  lede?: string
  align?: 'center' | 'left'
  onDark?: boolean
  launchStyle?: boolean
}) {
  return (
    <Reveal variant={launchStyle ? 'launch' : 'default'} className={align === 'center' ? 'text-center' : 'text-left'}>
      <p
        className={cn(
          launchStyle ? `mb-4 ${launchEyebrow}` : `text-xs font-semibold uppercase tracking-[0.14em] mb-3 ${
            onDark ? 'text-[#8AACDB]' : 'text-[#4B83C4]'
          }`,
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={
          launchStyle
            ? `text-balance text-3xl font-semibold leading-[1.06] tracking-[-0.025em] md:text-[3.25rem] lg:text-[3.75rem] ${
                onDark ? 'text-white' : 'text-[#1C1E26]'
              }`
            : `text-3xl md:text-[2.6rem] font-semibold tracking-tight leading-[1.12] ${
                onDark ? 'text-white' : 'text-[#1C1E26]'
              }`
        }
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-4 text-base md:text-lg leading-relaxed ${
            align === 'center' ? 'mx-auto' : ''
          } max-w-2xl ${onDark ? 'text-stone-300' : 'text-stone-600'}`}
        >
          {lede}
        </p>
      )}
    </Reveal>
  )
}

/** Subtle dashed orbit ring — the celestial accent used sparingly on cream sections. */
export function OrbitAccent({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none ${className}`}
      aria-hidden
      fill="none"
    >
      <circle cx="100" cy="100" r="96" stroke="#8AACDB" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 7" />
      <circle cx="100" cy="100" r="64" stroke="#8AACDB" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 7" />
      <circle cx="100" cy="4" r="3" fill="#4B83C4" fillOpacity="0.5" />
    </svg>
  )
}
