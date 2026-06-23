'use client'

import { ChevronRight } from 'lucide-react'
import { Reveal, SectionHeading } from '@/components/marketing/primitives/Reveal'
import { SectionLink } from '@/components/marketing/SectionLink'
import {
  DashboardCapturesMock,
  ExtensionRecapResultMock,
  WorkspaceChatMock,
} from '@/components/marketing/productMocks'
import { DEMO_BRIDGE_SOURCES } from '@/components/marketing/productMocks/sampleData'
import { cn } from '@/lib/utils'

const PILLARS = [
  {
    label: 'Capture context',
    labelColor: 'text-[#B45309]',
    title: 'Single source of truth for what you read',
    cta: 'Explore captures',
    href: '/#extension',
    mockSlot: 'min-h-[200px] md:min-h-[220px]',
    mock: (
      <div className="mx-auto w-full max-w-none overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background px-3 pt-3 md:w-[108%]">
        <p className="mb-2 px-1 text-sm font-semibold text-[#37352F]">Web Captures</p>
        <DashboardCapturesMock limit={2} size="compact" />
      </div>
    ),
  },
  {
    label: 'Keep connected',
    labelColor: 'text-[#C2410C]',
    title: 'Web memory goes stale. Yours doesn\u2019t.',
    cta: 'See auto-recaps',
    href: '/#workspace',
    mockSlot: 'min-h-[300px] flex-1 md:min-h-[340px]',
    mock: (
      <div className="flex h-full w-full flex-col px-3">
        <ExtensionRecapResultMock
          elevated={false}
          compact
          className="h-full min-h-[300px] w-full max-w-none rounded-b-none border-b-0 md:min-h-[340px]"
        />
      </div>
    ),
  },
  {
    label: 'Find answers',
    labelColor: 'text-[#2563EB]',
    title: 'Ask AI across your saved web memory',
    cta: 'See it search',
    href: '/#rag',
    mockSlot: 'min-h-[280px] md:min-h-[300px]',
    mock: (
      <div className="mx-auto flex min-h-[240px] w-full max-w-none flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card px-3 py-4 sm:min-h-[280px] md:w-[108%] md:min-h-[300px]">
        <WorkspaceChatMock
          variant="conversation"
          dense
          className="flex min-h-0 flex-1 flex-col"
          scenario={{
            userMessage: 'Cable-stayed vs suspension bridges?',
            assistantMessage:
              'Stay cables carry deck loads directly to towers [1].',
            sources: DEMO_BRIDGE_SOURCES.slice(0, 1),
          }}
        />
      </div>
    ),
  },
] as const

export default function ValuePillarsSection() {
  return (
    <section id="product" className="scroll-mt-24 bg-[#FDFBF7] py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Capture on the page. Search in the workspace."
          title="Finally, a web memory layer that does its job"
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.label} delay={i * 0.08}>
              <article className="flex min-h-0 w-full flex-col overflow-hidden rounded-[1.75rem] border border-[#E8DFD4] bg-[#F5EDE3] sm:min-h-[380px] md:aspect-2/3">
                <div className="flex shrink-0 flex-col items-center px-6 pb-4 pt-8 text-center md:px-7 md:pt-9">
                  <p className={`text-sm font-semibold ${pillar.labelColor}`}>{pillar.label}</p>
                  <h3 className="mt-3 max-w-[16rem] text-balance text-lg font-semibold leading-snug tracking-tight text-[#1C1E26] sm:text-xl">
                    {pillar.title}
                  </h3>
                  <SectionLink
                    href={pillar.href}
                    className="mt-5 inline-flex items-center gap-1 rounded-full border border-[#1C1E26] px-4 py-1.5 text-sm font-medium text-[#1C1E26] transition-colors hover:bg-[#1C1E26] hover:text-white"
                  >
                    {pillar.cta}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </SectionLink>
                </div>

                <div
                  className={cn(
                    'mt-auto flex w-full flex-col justify-end',
                    pillar.mockSlot,
                  )}
                >
                  {pillar.mock}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
