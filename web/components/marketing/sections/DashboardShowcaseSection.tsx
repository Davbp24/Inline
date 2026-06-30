import { LaunchBeat, Reveal } from '@/components/marketing/primitives/Reveal'
import { ProductVisualRing } from '@/components/marketing/primitives/ProductVisualRing'
import WorkspaceDashboardHeroAnimated from '@/components/marketing/productMocks/WorkspaceDashboardHeroAnimated'
import { launchEyebrow, launchHeadline, launchSectionRhythm } from '@/components/marketing/marketingSurfaces'

export default function DashboardShowcaseSection() {
  return (
    <section
      className={`scroll-mt-24 bg-gradient-to-b from-[#FDFBF7] to-[#FAF5EE] ${launchSectionRhythm}`}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <LaunchBeat product>
          <Reveal variant="launch" className="text-center">
            <p className={launchEyebrow}>Your workspace</p>
            <h2 className={`mt-4 ${launchHeadline}`}>Fifty tabs. One brief.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
              Your highlights become a source-backed recap you can trust.
            </p>
          </Reveal>

          <Reveal variant="launch" product delay={0.12} className="mt-14 md:mt-16">
            <ProductVisualRing innerRadius="2xl" tone="navy">
              <div
                className="overflow-hidden rounded-2xl border border-border bg-white"
                aria-label="Inline workspace dashboard preview"
              >
                <WorkspaceDashboardHeroAnimated />
              </div>
            </ProductVisualRing>
          </Reveal>
        </LaunchBeat>
      </div>
    </section>
  )
}
