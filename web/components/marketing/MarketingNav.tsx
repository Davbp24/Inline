'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Nav links point at real marketing-page anchors. No fake product sub-menus —
 * the dropdown chevron was removed to match the simplified product surface.
 */
const NAV_LINKS = [
  { label: 'Features',  href: '#features'  },
  { label: 'Workspace', href: '#workspace' },
  { label: 'Ask',       href: '#ask'       },
  { label: 'Extension', href: '#install'   },
  { label: 'Pricing',   href: '#pricing'   },
]

/** Inline word-mark. Adapts to the current nav surface (dark hero vs cream scroll). */
function InlineLogo({ onDark, className }: { onDark: boolean; className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          onDark ? 'bg-white/95' : 'bg-[#1C1E26]',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'block h-4 w-1 rounded-full -rotate-12',
            onDark ? 'bg-[#0B1735]' : 'bg-white',
          )}
        />
      </div>
      <span
        className={cn(
          'font-semibold text-lg tracking-tight transition-colors',
          onDark ? 'text-white' : 'text-[#1C1E26]',
        )}
      >
        inline
        <span className={cn('ml-0.5 text-sm align-top', onDark ? 'text-white/60' : 'text-stone-400')}>
          ~
        </span>
      </span>
    </Link>
  )
}

export default function MarketingNav() {
  // `pastHero` is true once the navy hero section has scrolled fully behind the
  // fixed nav. Until then we sit on the navy and need the light palette —
  // flipping earlier makes the nav look washed out halfway down the hero.
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    // Measured from a CSS custom property so we don't have to hardcode the nav
    // height, but falls back to a sensible default.
    const NAV_HEIGHT = 72

    const hero = document.querySelector<HTMLElement>('[data-hero]')

    const update = () => {
      if (!hero) {
        setPastHero(window.scrollY > 8)
        return
      }
      const rect = hero.getBoundingClientRect()
      // The hero is "past" once its bottom edge is above the nav's bottom edge.
      setPastHero(rect.bottom <= NAV_HEIGHT)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // While we're still on the navy hero the nav is transparent and needs light
  // text; once the user has actually scrolled past the hero we flip to the
  // cream-glass dark palette.
  const onDark = !pastHero

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        pastHero
          ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/60'
          : 'bg-[#0B1735]',
      )}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-10 py-3.5">
        <InlineLogo onDark={onDark} />

        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-full transition-colors',
                  onDark
                    ? 'text-stone-200 hover:text-white'
                    : 'text-stone-600 hover:text-[#1C1E26]',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Sign in — bordered pill, previously the "Book a demo" slot */}
          <Link
            href="/auth/login"
            className={cn(
              'inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors',
              onDark
                ? 'border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10'
                : 'border-stone-300 bg-transparent text-stone-800 hover:border-stone-400 hover:bg-white',
            )}
          >
            Sign in
          </Link>
          {/* Primary CTA — filled pill */}
          <Link
            href="/app/dashboard"
            className={cn(
              'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-colors',
              onDark
                ? 'bg-white text-[#0B1735] hover:bg-stone-100'
                : 'bg-[#1C1E26] text-white hover:bg-stone-800',
            )}
          >
            Open your workspace
          </Link>
        </div>
      </nav>
    </header>
  )
}
