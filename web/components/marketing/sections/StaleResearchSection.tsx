'use client'

import { LaunchBeat, Reveal } from '@/components/marketing/primitives/Reveal'
import { SectionLink } from '@/components/marketing/SectionLink'
import ExtensionDockSceneAnimated from '@/components/marketing/productMocks/ExtensionDockSceneAnimated'
import {
  launchEyebrow,
  launchHeadline,
  launchSectionRhythm,
  mktBtnTextLink,
} from '@/components/marketing/marketingSurfaces'

export default function StaleResearchSection() {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-b from-[#FDFBF7] to-[#FAF5EE] ${launchSectionRhythm}`}
    >
      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <LaunchBeat>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal variant="launch" className="text-center lg:text-left">
              <p className={launchEyebrow}>Staying current</p>
              <h2 className={`mt-4 ${launchHeadline}`}>Research stays fresh.</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg lg:mx-0">
                Inline watches annotated pages and drafts updated briefs when sources change.
              </p>
              <SectionLink href="/#workspace" className={`mt-8 inline-flex ${mktBtnTextLink}`}>
                See how it works
              </SectionLink>
            </Reveal>

            <Reveal variant="launch" product delay={0.12}>
              <ExtensionDockSceneAnimated className="mx-auto w-full lg:mx-0" />
            </Reveal>
          </div>
        </LaunchBeat>
      </div>
    </section>
  )
}
