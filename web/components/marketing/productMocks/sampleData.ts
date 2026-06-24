import type { ChatSource } from '@/components/shell/SourceCard'

/** Placeholder domain for marketing mocks — not a real website. */
export const DEMO_DOMAIN = 'article-source.com'

export const DEMO_PAGE_TITLE = 'Source page title'
export const DEMO_PAGE_TITLE_ALT = 'Related article'
export const DEMO_PAGE_TITLE_RECAP = 'Page recap'

function demoUrl(path: string): string {
  return `https://${DEMO_DOMAIN}/${path}`
}

export const DEMO_WORKSPACE_ID = 'ws-1'

export const DEMO_BRIDGE_SOURCES: ChatSource[] = [
  {
    ref: 1,
    sourceType: 'note',
    sourceId: 'demo-note-1',
    pageUrl: demoUrl('source-page'),
    pageTitle: DEMO_PAGE_TITLE,
    domain: DEMO_DOMAIN,
    snippet: 'Your note on the opening argument and how the author frames the topic.',
    similarity: 0.92,
  },
  {
    ref: 2,
    sourceType: 'recap',
    sourceId: 'demo-recap-1',
    pageUrl: demoUrl('source-page'),
    pageTitle: DEMO_PAGE_TITLE_RECAP,
    domain: DEMO_DOMAIN,
    snippet: 'Auto-recap pulls in your latest highlights and sticky notes.',
    similarity: 0.88,
  },
  {
    ref: 3,
    sourceType: 'note',
    sourceId: 'demo-note-2',
    pageUrl: demoUrl('related-article'),
    pageTitle: DEMO_PAGE_TITLE_ALT,
    domain: DEMO_DOMAIN,
    snippet: 'A second capture with supporting details from another section.',
    similarity: 0.81,
  },
]

export const DEMO_CAPTURES = [
  {
    title: DEMO_PAGE_TITLE,
    preview: 'Opening section summarizes the main argument…',
    domain: DEMO_DOMAIN,
    time: '2h ago',
    pinned: true,
  },
  {
    title: DEMO_PAGE_TITLE_ALT,
    preview: 'Supporting points from a paragraph you highlighted…',
    domain: DEMO_DOMAIN,
    time: '1d ago',
    pinned: false,
  },
  {
    title: 'Follow-up reading',
    preview: 'Notes merged from a second pass through the article…',
    domain: DEMO_DOMAIN,
    time: '3d ago',
    pinned: false,
  },
  {
    title: 'Background context',
    preview: 'Definitions and terms you marked for later…',
    domain: DEMO_DOMAIN,
    time: '5d ago',
    pinned: false,
  },
] as const

export const DEMO_LIBRARY_DOCS = [
  {
    title: DEMO_PAGE_TITLE,
    preview: 'Auto-recap: key claims, highlights, and notes in one doc.',
    autoRecap: true,
    time: '2h ago',
  },
  {
    title: 'Follow-up reading',
    preview: 'Highlights from a related section merged into one recap.',
    autoRecap: true,
    time: '1d ago',
  },
  {
    title: DEMO_PAGE_TITLE_ALT,
    preview: 'Captures summarized with your notes on the main takeaways.',
    autoRecap: true,
    time: '3d ago',
  },
  {
    title: 'Reading list notes',
    preview: 'Compared two articles you saved during the same session.',
    autoRecap: true,
    time: '5d ago',
  },
] as const

/** Domains shown in “cited answers” and analytics mocks */
export const DEMO_TOP_DOMAINS = [DEMO_DOMAIN, 'notes-archive.test', 'reading-list.test'] as const
