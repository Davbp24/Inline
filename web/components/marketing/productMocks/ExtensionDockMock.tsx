import InlineBrandGlyph from '@/components/marketing/InlineBrandGlyph'
import { product } from '@/components/marketing/marketingSurfaces'
import {
  IconAi,
  IconDraw,
  IconEyeOff,
  IconHighlight,
  IconMore,
  IconNotebook,
  IconRewrite,
  IconSearch,
} from '@/components/marketing/extensionToolIcons'
import { cn } from '@/lib/utils'

const DOCK_TOOLS = [
  { id: 'ai', icon: <IconAi size={16} /> },
  { id: 'rewrite', icon: <IconRewrite size={16} /> },
  { id: 'highlight', icon: <IconHighlight size={16} /> },
  { id: 'search', icon: <IconSearch size={16} /> },
  { id: 'more', icon: <IconMore size={16} /> },
  { id: 'draw', icon: <IconDraw size={16} /> },
] as const

type ExtensionDockMockProps = {
  className?: string
  showNotebook?: boolean
  activeIndex?: number
  orientation?: 'vertical' | 'horizontal'
}

export default function ExtensionDockMock({
  className,
  showNotebook = true,
  activeIndex = 0,
  orientation = 'vertical',
}: ExtensionDockMockProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={cn(
        isHorizontal ? 'flex flex-row items-center gap-1.5' : 'flex flex-col items-center gap-1.5',
        className,
      )}
    >
      <div
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] border border-white/20 bg-[#0B1735] shadow-[0_8px_20px_-8px_rgba(11,23,53,0.55)]"
      >
        <InlineBrandGlyph tile={false} />
      </div>
      <div
        className={cn(
          'flex gap-0.5 rounded-[17px] border border-white/70 bg-white/90 p-1.5 backdrop-blur-xl',
          isHorizontal ? 'flex-row' : 'flex-col',
        )}
        style={{ boxShadow: product.elevatedDockShadow }}
      >
        {DOCK_TOOLS.map((tool, i) => (
          <div
            key={tool.id}
            className={cn(
              'flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-muted-foreground transition-colors duration-300',
              i === activeIndex && 'bg-white text-foreground shadow-sm ring-1 ring-black/[0.06]',
            )}
          >
            {tool.icon}
          </div>
        ))}
        {showNotebook && (
          <>
            <div className={cn(isHorizontal ? 'mx-0.5 h-6 w-px bg-border' : 'mx-1 my-0.5 h-px bg-border')} />
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-muted-foreground">
              <IconNotebook size={16} />
            </div>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-muted-foreground">
              <IconEyeOff size={16} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
