'use client'

import {
  renderHeroToolIcon,
  type HeroToolIconId,
} from '@/components/marketing/extensionToolIcons'
import InlineBrandGlyph from '@/components/marketing/InlineBrandGlyph'
import {
  mktHeroAmbient,
  mktHeroTileBackdrop,
  mktHeroTileBorder,
  mktHeroTileGlass,
  mktLogoTileShadow,
  mktTileShadow,
  mktTileShadowEmphasis,
} from '@/components/marketing/marketingSurfaces'

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

const glassTileStyle = {
  width: TILE_PX,
  height: TILE_PX,
  borderRadius: 18,
  background: mktHeroTileGlass,
  border: mktHeroTileBorder,
  backdropFilter: mktHeroTileBackdrop,
  WebkitBackdropFilter: mktHeroTileBackdrop,
  boxShadow:
    'inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.12)',
} as const

function ToolTile({
  tool,
  emphasized,
}: {
  tool: HeroToolIconId
  emphasized?: boolean
}) {
  return (
    <div
      className="relative isolate flex shrink-0 items-center justify-center overflow-hidden text-[#2F2F30]"
      style={{
        ...glassTileStyle,
        boxShadow: `${glassTileStyle.boxShadow}, ${emphasized ? mktTileShadowEmphasis : mktTileShadow}`,
      }}
    >
      <span className="flex h-8 w-8 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
        {renderHeroToolIcon(tool, GLYPH_SIZE)}
      </span>
    </div>
  )
}

export default function HeroCaptureGrid() {
  return (
    <div
      className="relative mx-auto mb-6 flex w-full max-w-[52rem] shrink-0 items-center justify-center px-2"
      style={{ height: 'clamp(280px, 36vh, 360px)' }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[600px] max-w-[95%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: mktHeroAmbient,
          filter: 'blur(28px)',
        }}
      />

      <div
        className="relative mx-auto h-[332px] w-[820px] max-w-full origin-center scale-[0.58] sm:scale-[0.88] md:scale-100"
        style={{
          maskImage:
            'radial-gradient(50% 60% at 50% 55%, black 25%, transparent 90%)',
          WebkitMaskImage:
            'radial-gradient(50% 60% at 50% 55%, black 25%, transparent 90%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(circle at 38% 42%, rgba(232, 160, 130, 0.34) 0%, transparent 52%), radial-gradient(circle at 62% 58%, rgba(210, 195, 255, 0.22) 0%, transparent 48%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
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
                <div
                  key="logo"
                  className="shrink-0 overflow-hidden"
                  style={{
                    ...glassTileStyle,
                    background: 'transparent',
                    border: '2px solid transparent',
                    boxShadow: mktLogoTileShadow,
                  }}
                >
                  <InlineBrandGlyph />
                </div>
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
