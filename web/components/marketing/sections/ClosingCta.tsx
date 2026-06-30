import Link from 'next/link'
import FrostedGrainSurface from '@/components/marketing/primitives/FrostedGrainSurface'
import { Reveal } from '@/components/marketing/primitives/Reveal'
import {
  launchEyebrow,
  launchHeadline,
  launchSectionRhythm,
  mkt,
  mktBtnPrimaryLg,
  mktBtnTextLink,
} from '@/components/marketing/marketingSurfaces'

/** Warm closing wash — echoes hero amber/navy anchors at lower intensity. */
const CLOSING_MESH = [
  'radial-gradient(circle at 86% 12%, rgba(252, 163, 17, 0.34) 0%, transparent 48%)',
  'radial-gradient(circle at 12% 84%, rgba(11, 23, 53, 0.32) 0%, transparent 52%)',
  'radial-gradient(ellipse 90% 75% at 50% 44%, rgba(255, 255, 255, 0.52) 0%, transparent 72%)',
  'radial-gradient(ellipse 62% 48% at 50% 58%, rgba(245, 237, 227, 0.82) 0%, transparent 76%)',
  `linear-gradient(168deg, ${mkt.tan} 0%, ${mkt.cream} 46%, ${mkt.creamLight} 100%)`,
]

export default function ClosingCta() {
  return (
    <section className={`relative overflow-hidden ${launchSectionRhythm}`}>
      <FrostedGrainSurface baseColor={mkt.cream} meshLayers={CLOSING_MESH} />

      {/* Seam from FAQ gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-1 h-32 bg-gradient-to-b from-[#FAF5EE] to-transparent"
        aria-hidden
      />
      {/* Center lift — keeps copy legible over the mesh */}
      <div
        className="pointer-events-none absolute inset-0 z-1 opacity-45"
        style={{
          background:
            'radial-gradient(ellipse 70% 54% at 50% 48%, rgba(253, 251, 247, 0.78) 0%, transparent 72%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-10">
        <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/58 px-8 py-12 backdrop-blur-2xl sm:px-11 sm:py-14 md:rounded-[2rem] md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/42 via-white/14 to-transparent"
            aria-hidden
          />

          <Reveal variant="launch" className="relative text-center">
            <p className={launchEyebrow}>Get started</p>
            <h2 className={`mt-4 ${launchHeadline}`}>
              Stop collecting. Start compounding.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-700 md:text-lg">
              Install the extension, highlight what matters, and build a workspace you trust.
            </p>
          </Reveal>
          <Reveal
            variant="launch"
            delay={0.1}
            className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/install" className={`w-full sm:w-auto ${mktBtnPrimaryLg}`}>
              Add to Chrome
            </Link>
            <Link href="/auth/register" className={mktBtnTextLink}>
              Create your workspace
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
