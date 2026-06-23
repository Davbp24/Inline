import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Chrome,
  Download,
  FolderOpen,
  LogIn,
  MousePointerClick,
  Pin,
  RefreshCcw,
  ToggleRight,
} from 'lucide-react'
import { INLINE_PRODUCTION_ORIGIN } from '@/lib/inline-origin'
import { getChromeWebStoreUrl } from '@/lib/site-contact'

export const metadata: Metadata = {
  title: 'Install Inline — Chrome extension',
  description: 'Install the Inline Chrome extension and connect it to your workspace.',
}

const STORE_STEPS = [
  {
    icon: Chrome,
    title: 'Install from the Chrome Web Store',
    body: 'Add Inline to Chrome with one click. The extension connects to the hosted workspace at useinline.vercel.app.',
  },
  {
    icon: Pin,
    title: 'Pin Inline to your toolbar',
    body: 'Click the puzzle icon in Chrome, then pin Inline so the dock is easy to reach on any page.',
  },
  {
    icon: LogIn,
    title: 'Sign in to your workspace',
    body: `Open ${INLINE_PRODUCTION_ORIGIN}, create an account or sign in, and open your workspace dashboard.`,
  },
  {
    icon: RefreshCcw,
    title: 'Start capturing',
    body: 'Your session syncs to the extension automatically. Highlights, notes, AI tools, and read-aloud work on any page you visit.',
  },
]

const COMING_SOON_STEPS = [
  {
    icon: Chrome,
    title: 'Chrome Web Store listing',
    body: 'Inline is being submitted to the Chrome Web Store. The install button on this page will appear once the listing is approved.',
  },
  {
    icon: LogIn,
    title: 'Workspace is live now',
    body: `You can create your account and use the dashboard today at ${INLINE_PRODUCTION_ORIGIN}.`,
  },
  {
    icon: RefreshCcw,
    title: 'Extension sync after install',
    body: 'Once the store listing is live, install the extension and sign in — your session will sync automatically.',
  },
]

const DEV_STEPS = [
  {
    icon: Download,
    title: 'Get the extension build',
    body: 'Clone the repository and run `npm install && npm run build` inside the inlineExtension folder to produce dist/.',
  },
  {
    icon: FolderOpen,
    title: 'Open Chrome extensions',
    body: 'Visit chrome://extensions in Chrome or another Chromium browser.',
  },
  {
    icon: ToggleRight,
    title: 'Enable Developer mode',
    body: 'Flip the Developer mode toggle in the top-right corner of the extensions page.',
  },
  {
    icon: MousePointerClick,
    title: 'Load unpacked',
    body: 'Click Load unpacked and select the inlineExtension/dist folder.',
  },
]

export default function InstallPage() {
  const storeUrl = getChromeWebStoreUrl()
  const steps = storeUrl ? STORE_STEPS : COMING_SOON_STEPS

  return (
    <div className="bg-white min-h-screen">
      <section data-hero className="bg-[#0B1735] pt-36 pb-20 px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8AACDB] mb-3">
          Get Inline
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
          Install the extension
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base md:text-lg leading-relaxed text-stone-300">
          {storeUrl
            ? 'Add Inline from the Chrome Web Store, sign in once, and start capturing on any page.'
            : 'The workspace is live. The Chrome Web Store listing is in progress — create your account now and install when the store link goes live.'}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {storeUrl && (
          <div className="mb-8 flex justify-center">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1E26] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B83C4]"
            >
              <Chrome className="h-4 w-4" aria-hidden />
              Install from Chrome Web Store
            </a>
          </div>
        )}

        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-5 rounded-2xl border border-stone-200/80 bg-white p-6">
              <div className="flex flex-col items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9DAF0] bg-[#EBF1F7] text-sm font-semibold text-[#4B83C4]">
                  {i + 1}
                </span>
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1C1E26]">
                  <step.icon className="h-4 w-4 text-[#4B83C4]" aria-hidden />
                  {step.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {!storeUrl && (
          <p className="mt-6 text-center text-sm text-stone-500">
            Set <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_CHROME_WEB_STORE_URL</code>{' '}
            on Vercel after approval to enable the store install button here.
          </p>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-full bg-[#1C1E26] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B83C4]"
          >
            Create your workspace
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-7 py-3 text-sm font-medium text-stone-800 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B83C4]"
          >
            Privacy policy
          </Link>
        </div>

        <details className="mt-12 rounded-2xl border border-stone-200/80 bg-[#F7F7F5] p-6">
          <summary className="cursor-pointer text-sm font-semibold text-[#1C1E26]">
            For developers — load unpacked from source
          </summary>
          <ol className="mt-6 space-y-4">
            {DEV_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-5 rounded-2xl border border-stone-200/80 bg-white p-5">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C9DAF0] bg-[#EBF1F7] text-xs font-semibold text-[#4B83C4]">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C1E26]">
                    <step.icon className="h-4 w-4 text-[#4B83C4]" aria-hidden />
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            For local development, use <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs border border-stone-200">npm run build:dev</code>{' '}
            in <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs border border-stone-200">inlineExtension/</code>{' '}
            and run the web app (<code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs border border-stone-200">web/</code>, port 3000) plus
            annotation backend (<code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs border border-stone-200">backend/</code>, port 3030).
          </p>
        </details>
      </section>
    </div>
  )
}
