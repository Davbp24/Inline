import { ChevronRight, Lock } from 'lucide-react'
import { Reveal } from '@/components/marketing/primitives/Reveal'
import { SectionLink } from '@/components/marketing/SectionLink'
import { SourceCardRow } from '@/components/shell/SourceCard'
import WorkspaceChatMock from '@/components/marketing/productMocks/WorkspaceChatMock'
import {
  DEMO_BRIDGE_SOURCES,
  DEMO_DOMAIN,
  DEMO_TOP_DOMAINS,
  DEMO_WORKSPACE_ID,
} from '@/components/marketing/productMocks/sampleData'
import { cn } from '@/lib/utils'

const DOMAINS = DEMO_TOP_DOMAINS

const SOURCE_CARD_WIDTH =
  '[--source-card-mobile-width:min(11rem,calc(100vw-6rem))] [&_.scrollbar-minimal>*]:w-[var(--source-card-mobile-width)] md:[&_.scrollbar-minimal>*]:w-40'

/** White product mock — scrolls inside the fixed card height when content is tall. */
const MOCK_SHELL =
  'mx-auto flex w-full max-w-none min-h-0 max-h-full flex-col overflow-x-hidden overflow-y-auto rounded-t-2xl border border-b-0 border-border bg-card px-3 py-3 pb-4 xl:w-[108%]'

const CARDS = [
  {
    label: 'Source citations',
    labelColor: 'text-[#2563EB]',
    title: 'Real source cards from retrieval',
    cta: 'See citations',
    href: '/#rag' as const,
    mock: (
      <div className={MOCK_SHELL}>
        <WorkspaceChatMock
          dense
          variant="conversation"
          className="shrink-0"
          scenario={{
            userMessage: 'What did I save about bridge loads?',
            assistantMessage:
              'Stay cables carry deck loads directly [1]. Recap notes faster construction [2].',
            sources: DEMO_BRIDGE_SOURCES.slice(0, 2),
          }}
        />
        <div className={cn('mt-2 min-w-0 shrink-0', SOURCE_CARD_WIDTH)}>
          <SourceCardRow
            sources={DEMO_BRIDGE_SOURCES.slice(0, 2)}
            workspaceId={DEMO_WORKSPACE_ID}
          />
        </div>
      </div>
    ),
  },
  {
    label: 'Workspace only',
    labelColor: 'text-[#B45309]',
    title: 'Semantic search scoped to you',
    cta: 'How scope works',
    href: '/#rag' as const,
    mock: (
      <div className={MOCK_SHELL}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Retrieval scope
        </p>
        <div className="mt-2 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-foreground">Your workspace</span>
            <span className="text-[#22C55E]">Full access</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Other workspaces</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" aria-hidden />
              No access
            </span>
          </div>
        </div>
        <div className={cn('mt-3 min-w-0 shrink-0', SOURCE_CARD_WIDTH)}>
          <SourceCardRow sources={[DEMO_BRIDGE_SOURCES[0]!]} workspaceId={DEMO_WORKSPACE_ID} />
        </div>
      </div>
    ),
  },
  {
    label: 'Cross-page',
    labelColor: 'text-[#C2410C]',
    title: 'Answers across every capture on a site',
    cta: 'Try cross-page ask',
    href: '/#rag' as const,
    mock: (
      <div className={MOCK_SHELL}>
        <WorkspaceChatMock
          dense
          variant="conversation"
          className="shrink-0"
          scenario={{
            userMessage: `Compare what I saved on ${DEMO_DOMAIN}.`,
            assistantMessage:
              'Suspension decks hang from anchored cables [1]. Cable-stayed towers carry loads directly [2].',
            sources: DEMO_BRIDGE_SOURCES.slice(0, 2),
            recencyNote: `Searching captures across ${DEMO_DOMAIN} in your workspace.`,
          }}
        />
        <div className={cn('mt-2 min-w-0 shrink-0', SOURCE_CARD_WIDTH)}>
          <SourceCardRow
            sources={DEMO_BRIDGE_SOURCES.slice(0, 2)}
            workspaceId={DEMO_WORKSPACE_ID}
          />
        </div>
      </div>
    ),
  },
] as const

export default function CitedAnswersSection() {
  return (
    <section className="bg-[#FDFBF7] py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal className="text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#1C1E26] md:text-[2.75rem] md:leading-[1.1]">
            Your captures, cited the same way in the workspace chat.
          </h2>
        </Reveal>

        <Reveal delay={0.06} className="mt-8 flex justify-center">
          <SectionLink
            href="/#rag"
            className="inline-flex items-center gap-1 rounded-full border border-[#1C1E26] px-5 py-2 text-sm font-medium text-[#1C1E26] transition-colors hover:bg-[#1C1E26] hover:text-white"
          >
            Explore AI search
            <ChevronRight className="h-4 w-4" aria-hidden />
          </SectionLink>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {DOMAINS.map(domain => (
              <span
                key={domain}
                className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground sm:px-3 sm:py-1.5 sm:text-xs"
              >
                {domain}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid min-w-0 gap-5 xl:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.label} delay={0.1 + i * 0.04} className="min-w-0">
              <article className="flex min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-[1.75rem] border border-[#E8DFD4] bg-[#F5EDE3] sm:min-h-[380px] xl:aspect-2/3">
                <div className="flex shrink-0 flex-col items-center px-6 pb-4 pt-8 text-center md:px-7 md:pt-9">
                  <p className={cn('text-sm font-semibold', card.labelColor)}>{card.label}</p>
                  <h3 className="mt-3 max-w-[16rem] text-balance text-lg font-semibold leading-snug tracking-tight text-[#1C1E26] sm:text-xl">
                    {card.title}
                  </h3>
                  <SectionLink
                    href={card.href}
                    className="mt-5 inline-flex items-center gap-1 rounded-full border border-[#1C1E26] px-4 py-1.5 text-sm font-medium text-[#1C1E26] transition-colors hover:bg-[#1C1E26] hover:text-white"
                  >
                    {card.cta}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </SectionLink>
                </div>

                <div className="mt-auto flex min-h-0 flex-1 w-full flex-col justify-end overflow-hidden">
                  {card.mock}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
