import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl, INLINE_PRODUCTION_ORIGIN } from '@/lib/inline-origin'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'A plain-language explanation of how Inline handles your data in the extension and workspace.',
}

const EFFECTIVE_DATE = 'June 23, 2026'

type PolicySection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
  neverBullets?: { heading: string; items: string[] }
}

const sections: PolicySection[] = [
  {
    title: 'Who we are',
    paragraphs: [
      `Inline is a Chrome extension and companion website at ${INLINE_PRODUCTION_ORIGIN} that helps you capture, annotate, and search what you read on the web. This page explains what information Inline handles when you use the extension and the site, and the choices you have.`,
      `If anything here is unclear, email us at ${SUPPORT_EMAIL}.`,
    ],
  },
  {
    title: 'What Inline reads and saves',
    paragraphs: [
      'Inline only works on pages you are actively viewing, and only when you use it — highlight text, add a note, draw on the page, ask AI a question, take a screenshot, or similar. Nothing runs in the background to watch where you browse.',
      'From those moments, Inline may handle:',
    ],
    bullets: [
      'The page address, title, and site name.',
      'Text you select, highlights, sticky notes, drawings, screenshots, and other captures you create.',
      'Your account name, email, and profile photo if you sign in.',
      'Workspace content you choose to save — documents, chat messages, recaps, and search history inside your workspace.',
    ],
    neverBullets: {
      heading: 'Inline never reads or collects:',
      items: [
        'Passwords for other websites, banking logins, or credentials you type into forms (unless you explicitly capture that text yourself).',
        'Your browsing history as a background log — we do not build a hidden record of every site you visit.',
        'Data for advertising, profiling, or resale.',
      ],
    },
  },
  {
    title: 'Your data stays on your device first',
    paragraphs: [
      'You can use Inline without an account. In that mode, your highlights, notes, and drawings are stored in your own browser on your device. They are not uploaded to our servers.',
      'Guest AI is limited to 10 prompts per browser. A small on-device identifier is used only to enforce that limit — not to track you across the web.',
      'You can remove local data anytime by clearing the extension’s storage in Chrome or uninstalling the extension.',
    ],
  },
  {
    title: 'Accounts and cloud sync',
    paragraphs: [
      'When you create an account and sign in, two kinds of data may be stored in the cloud:',
    ],
    bullets: [
      'Account information — your email and sign-in details, handled through our authentication provider so you can access your workspace securely.',
      'Synced captures — the notes, highlights, documents, and other items you save while signed in, stored under your own account so they appear in your dashboard and search.',
    ],
    neverBullets: {
      heading: '',
      items: [
        'This data is used only for the features you see — your dashboard, search, AI chat over your captures, and sync across devices. It is never sold and never used for advertising.',
        'When you have the dashboard open while signed in, your session can connect to the extension so new captures save under the right account. The extension does not secretly read cookies from other websites.',
      ],
    },
  },
  {
    title: 'Chrome Web Store Limited Use',
    paragraphs: [
      'Inline’s use of information received from Google APIs and the data it collects complies with the Chrome Web Store User Data Policy, including the Limited Use requirements.',
      'In plain terms: we only use your data to provide the features you can see and use yourself — annotate, capture, sync, search, and ask AI about your own material — and for nothing else.',
    ],
  },
  {
    title: 'AI and read-aloud',
    paragraphs: [
      'When you use AI tools (rewrite, summarize, workspace chat, page recap, and similar), Inline sends the text and context needed to answer your request — such as selected text, page details, or items from your workspace.',
      'AI processing is handled on our servers. API keys for AI and voice providers never live in your browser or inside the extension download.',
      'Read-aloud uses a secure server voice when available. If cloud voice is unavailable, your browser’s built-in voice may be used instead.',
    ],
  },
  {
    title: 'How long we keep data',
    paragraphs: [
      'Synced workspace data is kept while your account is active so you can access your captures and documents.',
      'Local guest data stays on your device until you remove it.',
      'We may retain limited technical logs for security and reliability, but not as a product feature you interact with.',
    ],
  },
  {
    title: 'Deleting your data',
    paragraphs: [
      'Signed-in users can delete individual captures and documents from the dashboard where delete controls are available.',
      'You can permanently delete your account and associated personal data from Account settings in the workspace.',
      `You can also email ${SUPPORT_EMAIL} from the address on your account if you need help with access, correction, or deletion.`,
      'Guest-only data on your device can be removed by clearing extension storage in Chrome or uninstalling Inline.',
    ],
  },
  {
    title: 'Security',
    paragraphs: [
      'Connections between the extension, website, and our servers use encryption (HTTPS).',
      'Sensitive items saved locally in the extension are encrypted on your device before storage.',
      'Your workspace data is tied to your account — other users cannot see your captures.',
      'We never ask you to paste API keys, passwords, or secrets into the extension.',
    ],
  },
  {
    title: 'What we don’t do',
    bullets: [
      'We do not sell or rent your data — to anyone, ever.',
      'We do not show ads or use your data for advertising.',
      'We do not use your captures to build interest profiles or retarget you elsewhere.',
      'We do not let people on our team read your content except when you ask for support, when we need to investigate abuse, when the law requires it, or when data is anonymized for internal operations.',
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      'Inline is a research and productivity tool, not a children’s product. We do not knowingly collect personal information from anyone under 13.',
      `If you believe a child has provided us information, contact ${SUPPORT_EMAIL} and we will delete it.`,
    ],
  },
  {
    title: 'Changes to this policy',
    paragraphs: [
      'If we change this policy, we will post the updated version on this page and revise the date at the top.',
      'For important changes that affect account holders, we will take reasonable steps to let you know — for example, a notice on the site or an email to your account address.',
    ],
  },
]

const extensionAccess = [
  {
    name: 'Save your work',
    reason: 'Keeps your notes, preferences, and local captures on your device.',
  },
  {
    name: 'See the page you’re on',
    reason: 'Only when you take an action like a screenshot or crop — not in the background.',
  },
  {
    name: 'Right-click actions',
    reason: 'Adds menu items you choose to use, such as clipping selected text.',
  },
  {
    name: 'Retry sync quietly',
    reason: 'Retries pending uploads if you were offline, without running constantly in the background.',
  },
  {
    name: 'Show tools on web pages',
    reason: 'Displays the dock, highlighter, notes, and AI panels on pages you visit.',
  },
  {
    name: 'Connect to your workspace',
    reason: `Talks securely to ${INLINE_PRODUCTION_ORIGIN} when you sign in, sync captures, or use cloud AI and voice.`,
  },
]

export default function PrivacyPage() {
  const siteUrl = getSiteUrl()
  const siteLabel = siteUrl.replace(/^https?:\/\//, '')

  return (
    <div className="bg-[#FDFBF7] text-[#1C1E26]">
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-32 lg:px-10">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">
            Inline · Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#12141A] md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#5F6675]">
            Effective {EFFECTIVE_DATE} · Last updated {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DFD8CF] bg-white p-6 shadow-[0_18px_60px_rgba(20,22,28,0.06)]">
          <h2 className="text-lg font-semibold text-[#12141A]">The short version</h2>
          <p className="mt-3 text-sm leading-7 text-[#5F6675]">
            Inline helps you highlight, annotate, and search pages <em>you choose to work on</em> in
            your own browser. Without an account, your captures stay on your device. If you sign in,
            they sync to your private workspace at{' '}
            <a
              href={siteUrl}
              className="font-medium text-[#12203f] underline underline-offset-4"
            >
              {siteLabel}
            </a>
            {' '}— used only for the features you see, never sold, never used for ads. Questions?{' '}
            <a
              href={SUPPORT_MAILTO}
              className="font-medium text-[#12203f] underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map(section => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-[#12141A]">{section.title}</h2>
              {section.paragraphs?.map(paragraph => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-[#5F6675]">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5F6675]">
                  {section.bullets.map(item => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#12203f]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.neverBullets && section.neverBullets.items.length > 0 && (
                <div className="mt-4">
                  {section.neverBullets.heading && (
                    <p className="text-sm font-medium text-[#12141A]">{section.neverBullets.heading}</p>
                  )}
                  <ul className="mt-2 space-y-2 text-sm leading-7 text-[#5F6675]">
                    {section.neverBullets.items.map(item => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#12203f]" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {section.title === 'Chrome Web Store Limited Use' && (
                <p className="mt-3 text-sm leading-7 text-[#5F6675]">
                  Read the full policy at{' '}
                  <a
                    href="https://developer.chrome.com/docs/webstore/program-policies/user-data-faq"
                    className="font-medium text-[#12203f] underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chrome Web Store User Data Policy
                  </a>
                  .
                </p>
              )}
            </section>
          ))}
        </div>

        <section className="mt-12 border-t border-[#E4DED7] pt-10">
          <h2 className="text-lg font-semibold text-[#12141A]">Why the extension asks for access</h2>
          <p className="mt-3 text-sm leading-7 text-[#5F6675]">
            Chrome shows permission names when you install. Here is what they mean in everyday language:
          </p>
          <div className="mt-5 space-y-4">
            {extensionAccess.map(row => (
              <div key={row.name} className="rounded-xl border border-[#E4DED7] bg-white p-4">
                <p className="text-sm font-semibold text-[#12141A]">{row.name}</p>
                <p className="mt-1 text-sm leading-6 text-[#5F6675]">{row.reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-[#E4DED7] bg-[#F7F3EE] p-8 text-center">
          <h2 className="text-lg font-semibold text-[#12141A]">Contact</h2>
          <p className="mt-2 text-sm leading-7 text-[#5F6675]">
            Questions, concerns, or deletion requests — we read every email.
          </p>
          <a
            href={SUPPORT_MAILTO}
            className="mt-4 inline-block text-base font-semibold text-[#12203f] underline underline-offset-4"
          >
            Email {SUPPORT_EMAIL}
          </a>
          <p className="mt-4 text-sm text-[#5F6675]">
            Signed-in? You can also delete your account from{' '}
            <Link href="/app/account" className="font-medium text-[#12203f] underline underline-offset-4">
              Account settings
            </Link>
            .
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="font-medium text-[#12203f] underline underline-offset-4">
            Home
          </Link>
          <Link href="/privacy" className="font-medium text-[#12203f] underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-medium text-[#12203f] underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/install" className="font-medium text-[#12203f] underline underline-offset-4">
            Install extension
          </Link>
        </div>
      </section>
    </div>
  )
}
