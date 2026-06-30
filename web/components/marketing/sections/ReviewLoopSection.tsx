'use client'

import Link from 'next/link'
import { LaunchBeat, Reveal } from '@/components/marketing/primitives/Reveal'
import { ProductVisualRing } from '@/components/marketing/primitives/ProductVisualRing'
import { WorkspaceDocumentsPreviewMock } from '@/components/marketing/productMocks'
import {
  launchEyebrow,
  launchHeadline,
  launchSectionRhythm,
  mktBtnTextLink,
} from '@/components/marketing/marketingSurfaces'
import { DEFAULT_WORKSPACES } from '@/lib/workspaces'
import { workspacePath } from '@/lib/workspace-routes'

const WORKSPACE_HOME = workspacePath(DEFAULT_WORKSPACES[0]!, 'dashboard')

export default function ReviewLoopSection() {
  return (
    <section
      id="workspace"
      className={`scroll-mt-24 overflow-hidden bg-[#FAF5EE] ${launchSectionRhythm}`}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <LaunchBeat product>
          <Reveal variant="launch" className="max-w-2xl lg:max-w-none">
            <p className={launchEyebrow}>Your library</p>
            <h2 className={`mt-4 ${launchHeadline}`}>Nothing saves without your say-so.</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
              Inline drafts recap updates as you read — you approve before anything compounds.
            </p>
            <Link href={WORKSPACE_HOME} className={`mt-6 inline-flex ${mktBtnTextLink}`}>
              Open workspace
            </Link>
          </Reveal>

          <Reveal variant="launch" product delay={0.12} className="mt-12 w-full md:mt-16">
            <ProductVisualRing innerRadius="2xl" tone="burntRed">
              <WorkspaceDocumentsPreviewMock />
            </ProductVisualRing>
          </Reveal>
        </LaunchBeat>
      </div>
    </section>
  )
}
