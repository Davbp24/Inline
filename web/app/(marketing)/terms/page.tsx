import type { Metadata } from 'next'
import Link from 'next/link'
import { INLINE_PRODUCTION_ORIGIN } from '@/lib/inline-origin'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Plain-language terms for using the Inline extension and workspace.',
}

const EFFECTIVE_DATE = 'June 23, 2026'

type TermsSection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

const sections: TermsSection[] = [
  {
    title: 'Agreement to these terms',
    paragraphs: [
      'These Terms of Service ("Terms") govern your use of the Inline Chrome extension, this website, and any related workspace or services (together, the "Service").',
      'By installing the extension, creating an account, or using the Service, you agree to these Terms. If you do not agree, do not use the Service.',
    ],
  },
  {
    title: 'What Inline is',
    paragraphs: [
      `Inline is a browser extension and companion website at ${INLINE_PRODUCTION_ORIGIN} that helps you capture, annotate, and search what you read on the web. It works on pages you visit in your own browser, at your own direction — highlights, notes, drawings, screenshots, AI assistance, and a searchable workspace.`,
      'Optional features include an account, cloud sync of the captures you choose to save, and a dashboard. How we handle data is described in our Privacy Policy.',
    ],
  },
  {
    title: 'Your responsibilities',
    bullets: [
      'Use the Service in compliance with applicable laws and regulations.',
      'Comply with the terms of any website you browse while using Inline.',
      'The captures you create with Inline are your own. You are responsible for how you gather, store, and use them.',
      'Do not use the Service to harvest personal information about other people without permission, attempt to access systems or data you are not authorized to access, or interfere with the operation of the Service.',
    ],
  },
  {
    title: 'Accounts',
    bullets: [
      'Provide accurate information when creating an account and keep it up to date.',
      'You are responsible for safeguarding your sign-in credentials and for all activity under your account.',
      'Accounts are personal — one account per person, not shared.',
      `If you believe your account has been accessed without authorization, notify us at ${SUPPORT_EMAIL}.`,
    ],
  },
  {
    title: 'Fees and subscriptions',
    paragraphs: [
      'The Service is free today. If we launch paid subscription plans in the future:',
    ],
    bullets: [
      'Pricing and plan details will be clearly displayed before you purchase.',
      'You will be able to cancel at any time.',
      'Refunds will be handled according to the refund policy stated at the time of purchase.',
      'We will communicate clearly before moving any feature from free to paid — we will not silently move you onto a paid plan.',
    ],
  },
  {
    title: 'Intellectual property and your data',
    paragraphs: [
      'The Inline name, logo, software, and website are owned by us and protected by applicable intellectual-property laws. These Terms do not grant you any right to use them except as needed to use the Service.',
      'The captures, notes, documents, and other material you create and store with the Service remain yours.',
    ],
  },
  {
    title: 'AI features',
    paragraphs: [
      'Inline includes optional AI tools such as rewrite, summarize, workspace chat, and page recaps. AI output may be inaccurate, incomplete, or outdated.',
      'You are responsible for reviewing AI-generated content before relying on it for important decisions. Inline does not provide professional, legal, financial, or medical advice.',
    ],
  },
  {
    title: 'Disclaimer of warranties',
    paragraphs: [
      'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'We do not warrant that the Service will be uninterrupted or error-free, or that captures, AI responses, or synced data will always be accurate, complete, or available. You use the Service at your own risk.',
    ],
  },
  {
    title: 'Limitation of liability',
    paragraphs: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.',
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM AROSE (OR, IF YOU HAVE PAID NOTHING, ZERO).',
    ],
  },
  {
    title: 'Relationship to other websites',
    paragraphs: [
      'Inline is an independent tool. It is not affiliated with, endorsed by, or sponsored by the websites you visit, annotate, or capture while using the Service.',
      'Your use of those websites is governed by their own terms, and you are responsible for complying with them.',
    ],
  },
  {
    title: 'Termination',
    paragraphs: [
      'You may stop using the Service at any time by uninstalling the extension and, if you have an account, deleting it from Account settings or emailing us.',
      'We may suspend or terminate your access if you violate these Terms or use the Service in a way that could harm us, other users, or third parties.',
      'Upon termination, your right to use the Service ends. Deletion of your data is handled as described in the Privacy Policy.',
    ],
  },
  {
    title: 'Changes to these terms',
    paragraphs: [
      'We may update these Terms from time to time. When we do, we will post the updated Terms on this page and revise the date at the top.',
      'For material changes, we will take reasonable steps to notify you — for example, a notice on this site or an email to your account address. Continued use of the Service after changes take effect means you accept the updated Terms.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="bg-[#FDFBF7] text-[#1C1E26]">
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-32 lg:px-10">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">
            Inline · Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#12141A] md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#5F6675]">
            Effective {EFFECTIVE_DATE} · Last updated {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DFD8CF] bg-white p-6 shadow-[0_18px_60px_rgba(20,22,28,0.06)]">
          <h2 className="text-lg font-semibold text-[#12141A]">The short version</h2>
          <p className="mt-3 text-sm leading-7 text-[#5F6675]">
            Inline is a research and capture tool that runs in your browser. Use it lawfully and
            responsibly. The content you save is yours. The service is free today. We are not
            affiliated with the websites you visit. The sections below are the full terms that
            govern your use — and our{' '}
            <Link href="/privacy" className="font-medium text-[#12203f] underline underline-offset-4">
              Privacy Policy
            </Link>{' '}
            explains how we handle data.
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
              {section.title === 'What Inline is' && (
                <p className="mt-3 text-sm leading-7 text-[#5F6675]">
                  Read our{' '}
                  <Link href="/privacy" className="font-medium text-[#12203f] underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </p>
              )}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-[#E4DED7] bg-[#F7F3EE] p-8 text-center">
          <h2 className="text-lg font-semibold text-[#12141A]">Contact</h2>
          <p className="mt-2 text-sm leading-7 text-[#5F6675]">
            Questions about these Terms? Get in touch.
          </p>
          <a
            href={SUPPORT_MAILTO}
            className="mt-4 inline-block text-base font-semibold text-[#12203f] underline underline-offset-4"
          >
            Email {SUPPORT_EMAIL}
          </a>
        </section>

        <p className="mt-10 text-center text-xs text-[#667085]">
          © {new Date().getFullYear()} Inline · Independent tool — not affiliated with third-party websites you visit.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
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
