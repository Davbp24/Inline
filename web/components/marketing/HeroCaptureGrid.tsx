'use client'

import {
  renderHeroToolIcon,
  type HeroToolIconId,
} from '@/components/marketing/extensionToolIcons'
import InlineBrandGlyph, { INLINE_BRAND_GRADIENT } from '@/components/marketing/InlineBrandGlyph'
import {
  mktHeroTileBackdrop,
  mktHeroTileBorder,
  mktHeroTileGlass,
  mktTileShadow,
  mktTileShadowEmphasis,
} from '@/components/marketing/marketingSurfaces'

export type HeroCaptureGridLayout = 'stacked' | 'exponential'

type TileDef = { tool?: HeroToolIconId; center?: boolean }

/**
 * Staggered keyboard-style rows with glass keycap tiles and center brand mark.
 * Row counts: 5 · 6 · 5 (logo center) · 3
 */
const ROWS: TileDef[][] = [
  [
    { tool: 'ai' },
    { tool: 'rewrite' },
    { tool: 'highlighter' },
    { tool: 'notes' },
    { tool: 'draw' },
  ],
  [
    { tool: 'handwriting' },
    { tool: 'stamps' },
    { tool: 'search' },
    { tool: 'screenshot' },
    { tool: 'laser' },
    { tool: 'layers' },
  ],
  [
    { tool: 'share' },
    { tool: 'settings' },
    { center: true },
    { tool: 'notebook' },
    { tool: 'more' },
  ],
  [
    { tool: 'eyeOff' },
    { tool: 'collapse' },
    { tool: 'pause' },
  ],
]

const ROW_OFFSETS = [0, 84, 168, 252]
const TILE_PX = 80
const GLYPH_SIZE = 32
const EXP_TILE_PX = 82
const EXP_GLYPH_SIZE = 34
const EXP_TILE_GAP = 12

const STACKED_MASK =
  'radial-gradient(50% 55% at 50% 42%, black 25%, transparent 90%)'

/**
 * Exponential "area chart" — keycap columns grow in height from the hero
 * midpoint toward the upper-right, tracing the region under an exp curve.
 */
const EXP_COLUMNS = 10
const EXP_MAX_HEIGHT = 9
const EXP_K = 2.4
const EXP_BRAND_COLUMN = 6

const EXP_ICON_POOL: HeroToolIconId[] = [
  'search',
  'notes',
  'highlighter',
  'draw',
  'handwriting',
  'rewrite',
  'screenshot',
  'ai',
  'laser',
  'layers',
  'share',
  'stamps',
  'notebook',
  'settings',
  'more',
  'eyeOff',
  'collapse',
  'pause',
]

const EXP_COLUMN_HEIGHTS: number[] = Array.from({ length: EXP_COLUMNS }, (_, i) => {
  const t = i / (EXP_COLUMNS - 1)
  const norm = (Math.exp(EXP_K * t) - 1) / (Math.exp(EXP_K) - 1)
  return Math.max(1, Math.round(1 + norm * (EXP_MAX_HEIGHT - 1)))
})

type ExpTile = { brand?: boolean; tool?: HeroToolIconId }

function buildExpColumns(): ExpTile[][] {
  let poolIndex = 0
  return EXP_COLUMN_HEIGHTS.map((height, col) =>
    Array.from({ length: height }, (_, row): ExpTile => {
      // row 0 is the top of each bottom-anchored column
      if (col === EXP_BRAND_COLUMN && row === 0) return { brand: true }
      const tool = EXP_ICON_POOL[poolIndex % EXP_ICON_POOL.length]!
      poolIndex += 1
      return { tool }
    }),
  )
}

const glassTileStyle = (size: number) =>
  ({
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.225),
    background: mktHeroTileGlass,
    border: mktHeroTileBorder,
    backdropFilter: mktHeroTileBackdrop,
    WebkitBackdropFilter: mktHeroTileBackdrop,
    boxShadow:
      'inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.12)',
  }) as const

function BrandTile({ size = TILE_PX }: { size?: number }) {
  const keycapInset =
    'inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 0 rgba(0, 0, 0, 0.22)'

  return (
    <div
      className="relative isolate flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.225),
        background: INLINE_BRAND_GRADIENT,
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: `${keycapInset}, ${mktTileShadowEmphasis}`,
      }}
    >
      <InlineBrandGlyph tile={false} />
    </div>
  )
}

function ToolTile({
  tool,
  emphasized,
  size = TILE_PX,
  glyphSize = GLYPH_SIZE,
}: {
  tool: HeroToolIconId
  emphasized?: boolean
  size?: number
  glyphSize?: number
}) {
  const tileStyle = glassTileStyle(size)

  return (
    <div
      className="relative isolate flex shrink-0 items-center justify-center overflow-hidden text-[#2F2F30]"
      style={{
        ...tileStyle,
        boxShadow: `${tileStyle.boxShadow}, ${emphasized ? mktTileShadowEmphasis : mktTileShadow}`,
      }}
    >
      <span
        className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        style={{ width: glyphSize, height: glyphSize }}
      >
        {renderHeroToolIcon(tool, glyphSize)}
      </span>
    </div>
  )
}

function StackedGrid() {
  return (
    <div
      className="relative mx-auto mt-2 flex w-full max-w-208 shrink-0 items-center justify-center px-2"
      style={{ height: 'clamp(300px, 88vw, 380px)' }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[380px] w-[640px] max-w-[95%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 72% 28%, rgba(252, 163, 17, 0.2) 0%, transparent 70%), radial-gradient(ellipse 50% 45% at 22% 68%, rgba(18, 69, 89, 0.18) 0%, transparent 72%)',
          filter: 'blur(32px)',
        }}
      />

      <div
        className="relative mx-auto h-[332px] w-[820px] max-w-full origin-center scale-[0.72] min-[420px]:scale-[0.78] sm:scale-[0.82] md:scale-[0.84]"
        style={{
          maskImage: STACKED_MASK,
          WebkitMaskImage: STACKED_MASK,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.28) 0%, transparent 62%)',
          }}
        />

        {ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="absolute left-1/2 z-10 flex -translate-x-1/2 gap-2 pb-1"
            style={{ top: ROW_OFFSETS[rowIndex] }}
          >
            {row.map((tile, colIndex) =>
              tile.center ? (
                <BrandTile key="logo" />
              ) : tile.tool ? (
                <ToolTile
                  key={`${rowIndex}-${colIndex}-${tile.tool}`}
                  tool={tile.tool}
                  emphasized={rowIndex === 2}
                />
              ) : null,
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ExponentialChart() {
  const columns = buildExpColumns()

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft glow behind the cluster */}
      <div
        className="pointer-events-none absolute bottom-[6%] right-[3%] h-[480px] w-[560px]"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 68% 55%, rgba(252, 163, 17, 0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 45% at 32% 82%, rgba(18, 69, 89, 0.12) 0%, transparent 72%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Keycap area chart — bottom-right anchored, columns grow toward upper-right */}
      <div className="absolute bottom-[8%] right-[1%] origin-bottom-right scale-[0.64] xl:scale-[0.76] 2xl:scale-[0.86]">
        <div
          className="relative"
          style={{
            maskImage:
              'radial-gradient(ellipse 72% 68% at 0% 100%, transparent 0%, black 52%), radial-gradient(ellipse 58% 52% at 100% 0%, transparent 0%, black 48%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 72% 68% at 0% 100%, transparent 0%, black 52%), radial-gradient(ellipse 58% 52% at 100% 0%, transparent 0%, black 48%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <div className="flex items-end" style={{ gap: EXP_TILE_GAP }}>
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col" style={{ gap: EXP_TILE_GAP }}>
                {column.map((tile, rowIndex) =>
                  tile.brand ? (
                    <BrandTile key={`brand-${colIndex}`} size={EXP_TILE_PX} />
                  ) : tile.tool ? (
                    <ToolTile
                      key={`${colIndex}-${rowIndex}-${tile.tool}`}
                      tool={tile.tool}
                      size={EXP_TILE_PX}
                      glyphSize={EXP_GLYPH_SIZE}
                    />
                  ) : null,
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type HeroCaptureGridProps = {
  layout?: HeroCaptureGridLayout
}

export default function HeroCaptureGrid({ layout = 'stacked' }: HeroCaptureGridProps) {
  if (layout === 'exponential') {
    return <ExponentialChart />
  }

  return <StackedGrid />
}
