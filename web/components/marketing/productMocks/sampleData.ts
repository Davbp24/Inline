import type { ChatSource } from '@/components/shell/SourceCard'

/** Placeholder domain for marketing mocks — not a real website. */
export const DEMO_DOMAIN = 'example-website.com'

function demoUrl(path: string): string {
  return `https://${DEMO_DOMAIN}/${path}`
}

export const DEMO_WORKSPACE_ID = 'ws-1'

export const DEMO_BRIDGE_SOURCES: ChatSource[] = [
  {
    ref: 1,
    sourceType: 'note',
    sourceId: 'demo-note-1',
    pageUrl: demoUrl('cable-stayed-design'),
    pageTitle: 'Cable-stayed bridge design',
    domain: DEMO_DOMAIN,
    snippet: 'Towers carry deck loads directly through stay cables rather than anchorages.',
    similarity: 0.92,
  },
  {
    ref: 2,
    sourceType: 'recap',
    sourceId: 'demo-recap-1',
    pageUrl: demoUrl('cable-stayed-design'),
    pageTitle: 'Cable-stayed recap',
    domain: DEMO_DOMAIN,
    snippet: 'Auto-recap notes shorter construction time vs suspension designs.',
    similarity: 0.88,
  },
  {
    ref: 3,
    sourceType: 'note',
    sourceId: 'demo-note-2',
    pageUrl: demoUrl('suspension-bridge'),
    pageTitle: 'Suspension bridge',
    domain: DEMO_DOMAIN,
    snippet: 'The deck hangs from main cables anchored at both ends.',
    similarity: 0.81,
  },
]

export const DEMO_CAPTURES = [
  {
    title: 'Cable-stayed bridge design',
    preview: 'Towers carry deck loads directly through stay cables…',
    domain: DEMO_DOMAIN,
    time: '2h ago',
    pinned: true,
  },
  {
    title: 'Suspension bridge',
    preview: 'Main cables anchored at both ends; deck hangs below…',
    domain: DEMO_DOMAIN,
    time: '1d ago',
    pinned: false,
  },
  {
    title: 'Bridge load distribution',
    preview: 'Highlighted comparison of cable-stayed vs suspension…',
    domain: DEMO_DOMAIN,
    time: '3d ago',
    pinned: false,
  },
  {
    title: 'Tower geometry & stay cables',
    preview: 'Notes on fan vs harp layouts and how loads reach the deck…',
    domain: DEMO_DOMAIN,
    time: '5d ago',
    pinned: false,
  },
] as const

export const DEMO_LIBRARY_DOCS = [
  {
    title: 'Cable-stayed bridge design',
    preview: 'Auto-recap: load paths, tower geometry, and construction trade-offs.',
    autoRecap: true,
    time: '2h ago',
  },
  {
    title: 'Bridge load distribution',
    preview: 'Stay cables vs suspension anchorages — highlights merged into one recap.',
    autoRecap: true,
    time: '1d ago',
  },
  {
    title: 'Suspension bridge overview',
    preview: 'Captures summarized with your notes on deck hanging mechanics.',
    autoRecap: true,
    time: '3d ago',
  },
  {
    title: 'Construction timelines',
    preview: 'Compared cable-stayed build speed vs suspension spans from your reading.',
    autoRecap: true,
    time: '5d ago',
  },
] as const

/** Domains shown in “cited answers” and analytics mocks */
export const DEMO_TOP_DOMAINS = [DEMO_DOMAIN] as const
