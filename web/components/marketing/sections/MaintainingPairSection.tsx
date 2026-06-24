import type { ReactNode } from 'react'
import { Reveal } from '@/components/marketing/primitives/Reveal'
import RecapStatusCardAnimated from '@/components/marketing/productMocks/RecapStatusCardAnimated'
import ExtensionRefreshRoutineMockAnimated from '@/components/marketing/productMocks/ExtensionRefreshRoutineMockAnimated'
import { cn } from '@/lib/utils'

function PairCard({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-[#E8DFD4] bg-[#FAF5EE] p-5 sm:p-6 md:p-8">
      {(title || description) && (
        <div className="shrink-0">
          {title && (
            <h3 className="text-xl font-semibold tracking-tight text-[#1C1E26] sm:text-2xl md:text-[1.75rem]">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-between gap-5 w-full',
          title || description ? 'mt-8' : 'mt-0 justify-center',
        )}
      >
        {children}
      </div>
    </article>
  )
}

export default function MaintainingPairSection() {
  return (
    <section className="bg-[#FDFBF7] py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal className="text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#1C1E26] md:text-[2.75rem] md:leading-[1.1]">
            Recaps that maintain themselves
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Every page recap uses the same extension panel — updated as you add highlights and notes.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <PairCard
              title="Self-updating recap"
              description="Highlights and notes on the page feed back into your recap — so the summary always reflects what you captured."
            >
              <RecapStatusCardAnimated />
            </PairCard>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <PairCard
              title="Run refresh routines on your captures"
              description="Review suggested recap changes in the extension before anything saves to your workspace."
            >
              <ExtensionRefreshRoutineMockAnimated className="w-full max-w-[342px]" />
            </PairCard>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
