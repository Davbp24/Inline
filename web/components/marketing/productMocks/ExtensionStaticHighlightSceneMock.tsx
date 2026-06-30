import ExtensionAskPanelMock from '@/components/marketing/productMocks/ExtensionAskPanelMock'
import ExtensionDockMock from '@/components/marketing/productMocks/ExtensionDockMock'
import ExtensionSelectionToolbarMock from '@/components/marketing/productMocks/ExtensionSelectionToolbarMock'
import { DEMO_DOMAIN } from '@/components/marketing/productMocks/sampleData'
import { mkt, product } from '@/components/marketing/marketingSurfaces'
import { cn } from '@/lib/utils'

const PAGE_LINES = [
  'The introduction sets up the main argument.',
  'Key terms are defined in the opening paragraphs.',
  'The author states the central point in section two.',
  'A supporting example appears midway through the page.',
] as const

type ExtensionStaticHighlightSceneMockProps = {
  className?: string
  badgeShape?: 'circle' | 'square'
}

function HighlightLine() {
  return (
    <p className="text-[11px] leading-[18px] text-foreground/40">
      The author states the{' '}
      <span className="rounded-[3px] bg-[#FEF08A] px-0.5 text-foreground/85">
        central point
      </span>{' '}
      in section two.
    </p>
  )
}

export default function ExtensionStaticHighlightSceneMock({
  className,
  badgeShape = 'circle',
}: ExtensionStaticHighlightSceneMockProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-[1.75rem]',
        className,
      )}
      aria-label="Extension preview: highlighting selected text"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="h-[62%]" style={{ backgroundColor: mkt.tan }} />
        <div className="h-[38%]" style={{ backgroundColor: product.brand }} />
      </div>

      <div className="relative z-10 p-4">
        <div className="rounded-xl border border-white/70 bg-white/82 px-3 py-2.5 shadow-[0_8px_24px_-12px_rgba(28,30,38,0.18)] backdrop-blur-xl">
          <p className="truncate text-[10px] font-medium tracking-wide text-muted-foreground/90">
            {DEMO_DOMAIN}
          </p>
          <div className="mt-1.5 space-y-1">
            {PAGE_LINES.map((line, index) => (
              index === 2 ? (
                <HighlightLine key={line} />
              ) : (
                <p key={line} className="text-[11px] leading-[18px] text-foreground/40">
                  {line}
                </p>
              )
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <ExtensionSelectionToolbarMock />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          <ExtensionAskPanelMock
            compact
            elevated
            className="w-full max-w-[342px]"
            badgeShape={badgeShape}
          />
          <ExtensionDockMock
            activeIndex={2}
            orientation="horizontal"
            showNotebook={false}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  )
}
