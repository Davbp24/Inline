import type { ReactNode } from 'react'
import { mkt } from '@/components/marketing/marketingSurfaces'
import { cn } from '@/lib/utils'

const RING_RADIUS = {
  xl: 'rounded-[calc(var(--radius-xl)+0.75rem)] sm:rounded-[calc(var(--radius-xl)+1rem)]',
  '2xl': 'rounded-[calc(var(--radius-2xl)+0.75rem)] sm:rounded-[calc(var(--radius-2xl)+1rem)]',
} as const

type ProductVisualRingProps = {
  children: ReactNode
  className?: string
  /** Matches the inner mock corner radius so the tan ring runs parallel. */
  innerRadius?: keyof typeof RING_RADIUS
}

/** Light tan frame around product mocks — extends outward so inner width stays unchanged. */
export function ProductVisualRing({
  children,
  className,
  innerRadius = 'xl',
}: ProductVisualRingProps) {
  return (
    <div className={cn('relative mx-auto', className)}>
      <div
        className={cn(
          'pointer-events-none absolute -inset-3 border border-[#E8DFD4] sm:-inset-4',
          RING_RADIUS[innerRadius],
        )}
        style={{ backgroundColor: mkt.tan }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  )
}
