'use client'

import { useState } from 'react'
import { LaunchBeat, Reveal } from '@/components/marketing/primitives/Reveal'
import WorkspaceChatMock, {
  type WorkspaceChatScenario,
} from '@/components/marketing/productMocks/WorkspaceChatMock'
import { DEMO_BRIDGE_SOURCES, DEMO_DOMAIN } from '@/components/marketing/productMocks/sampleData'
import { ProductVisualRing } from '@/components/marketing/primitives/ProductVisualRing'
import { formatDisplayTitle } from '@/lib/utils'
import {
  launchEyebrow,
  launchHeadline,
  launchSectionRhythm,
} from '@/components/marketing/marketingSurfaces'

const SCENARIOS: { id: string; label: string; scenario: WorkspaceChatScenario }[] = [
  {
    id: 'research',
    label: 'Research question',
    scenario: {
      userMessage: 'What did I highlight about the main argument in this article?',
      assistantMessage:
        'You highlighted the core claim in the opening section [1], a supporting example in the middle [2], and a note tying it to another capture [3].',
      sources: DEMO_BRIDGE_SOURCES,
    },
  },
  {
    id: 'recap',
    label: 'Recap lookup',
    scenario: {
      userMessage: `Summarize everything I captured on the ${DEMO_DOMAIN} article.`,
      assistantMessage:
        'The article covers the main argument, supporting examples, and your sticky notes. Your auto-recap was last updated today and links four highlights from the page.',
      sources: DEMO_BRIDGE_SOURCES.slice(0, 2),
    },
  },
  {
    id: 'compare',
    label: 'Cross-page ask',
    scenario: {
      userMessage: `Compare what I saved across two pages on ${DEMO_DOMAIN}.`,
      assistantMessage:
        'One capture focuses on the introduction and definitions. Your other saves emphasize the supporting examples and notes you added in the margins.',
      sources: DEMO_BRIDGE_SOURCES,
      recencyNote: `Searching captures across ${DEMO_DOMAIN} in your workspace.`,
    },
  },
]

export default function AiSearchTabsSection() {
  const [active, setActive] = useState(SCENARIOS[0]!.id)
  const scenario = SCENARIOS.find(s => s.id === active)?.scenario ?? SCENARIOS[0]!.scenario

  return (
    <section
      id="rag"
      className={`scroll-mt-24 bg-gradient-to-b from-[#FAF5EE] to-[#FDFBF7] ${launchSectionRhythm}`}
    >
      <div className="mx-auto max-w-6xl px-6 text-center lg:px-10">
        <LaunchBeat>
          <Reveal variant="launch">
            <p className={launchEyebrow}>AI search</p>
            <h2 className={`mx-auto mt-4 max-w-2xl ${launchHeadline}`}>
              Answers from your captures.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
              Ask in plain language — every response cites the highlights that grounded it.
            </p>
          </Reveal>

          <Reveal variant="launch" delay={0.08} className="mt-10 flex justify-center -mx-1 px-1">
            <div
              className="scrollbar-minimal inline-flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-full border border-border/70 bg-muted/80 p-1.5 backdrop-blur-sm"
              role="tablist"
              aria-label="Search scenarios"
            >
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active === s.id}
                  onClick={() => setActive(s.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active === s.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {formatDisplayTitle(s.label)}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal variant="launch" product delay={0.16} className="mt-12 text-left md:mt-14">
            <ProductVisualRing tone="burntOrange">
              <WorkspaceChatMock
                variant="panel"
                scenario={scenario}
                sessionTitle="Reading session"
                elevated={false}
              />
            </ProductVisualRing>
          </Reveal>
        </LaunchBeat>
      </div>
    </section>
  )
}
