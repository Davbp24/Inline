import { LaunchBeat, Reveal } from '@/components/marketing/primitives/Reveal'
import AskThoughtTrace from '@/components/marketing/AskThoughtTrace'
import { launchEyebrow, launchHeadline, launchSectionRhythm, mkt } from '@/components/marketing/marketingSurfaces'
import ExtensionStaticHighlightSceneMock from '@/components/marketing/productMocks/ExtensionStaticHighlightSceneMock'
import {
  ExtensionAskPanelMock,
  ExtensionDockSceneHighlightAnimated,
  WorkspaceChatMock,
} from '@/components/marketing/productMocks'

export default function ContextLayerSection() {
  return (
    <section
      id="extension"
      className={`scroll-mt-24 bg-gradient-to-b from-[#FAF5EE] to-[#FDFBF7] ${launchSectionRhythm}`}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <LaunchBeat>
          <Reveal variant="launch" className="max-w-2xl text-left">
            <p className={launchEyebrow}>Everywhere you read</p>
            <h2 className={`mt-4 ${launchHeadline}`}>
              Extension and workspace. Same tools.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
              Annotate in Chrome. Ask in your workspace — same panel, same citations.
            </p>
          </Reveal>

          <div className="mt-16 grid min-w-0 items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal variant="launch" product delay={0.1} className="flex h-full min-w-0 flex-col">
              <p className={`mb-4 ${launchEyebrow}`}>Chrome extension</p>
              <div className="sm:hidden">
                <ExtensionStaticHighlightSceneMock className="mx-auto w-full" />
              </div>
              <div className="hidden h-full sm:block">
                <ExtensionDockSceneHighlightAnimated className="h-full" />
              </div>
            </Reveal>

            <Reveal variant="launch" product delay={0.18} className="flex h-full min-w-0 flex-col">
              <p className={`mb-4 ${launchEyebrow}`}>Workspace chat</p>
              <WorkspaceChatMock
                variant="panel"
                sessionTitle="Reading session"
                elevated={false}
                className="h-full w-full"
              />
            </Reveal>
          </div>

          <Reveal variant="launch" product delay={0.26} className="mt-12 lg:mt-14">
            <div className="overflow-hidden rounded-2xl border border-[#E8DFD4]/60">
              <div className="flex flex-col lg:flex-row lg:items-stretch">
                <div
                  className="flex flex-1 flex-col items-center gap-5 p-4 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between"
                  style={{ backgroundColor: mkt.tan }}
                >
                  <ExtensionAskPanelMock
                    compact
                    elevated={false}
                    className="w-full max-w-[342px] shrink-0"
                  />
                  <AskThoughtTrace className="w-full max-w-sm lg:flex-1 lg:px-6" />
                </div>
                <div
                  className="flex items-center justify-center px-6 py-4 lg:w-[12rem] lg:shrink-0 lg:justify-start lg:py-8"
                  style={{ backgroundColor: mkt.espressoDark }}
                >
                  <p className="text-center text-sm font-medium leading-snug text-[#F5EDE3]/90 lg:text-left">
                    Page-grounded answers
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </LaunchBeat>
      </div>
    </section>
  )
}
