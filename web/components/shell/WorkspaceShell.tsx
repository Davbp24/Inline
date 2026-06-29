'use client'

import { AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/sidebar-context'
import { isDocumentEditorPath } from '@/lib/document-editor-view'
import { isStandaloneSettingsPath } from '@/lib/workspace-chrome'
import { ChatPanelProvider } from '@/lib/chat-panel-context'
import { InlineGuideProvider } from '@/lib/inline-guide-context'
import InlineGuideOverlay, { InlineGuideResumeChip } from '@/components/guide/InlineGuideOverlay'
import Sidebar from './Sidebar'
import WorkspaceMainContent from './WorkspaceMainContent'
import CommandPalette from './CommandPalette'
import RightContextPanel from './RightContextPanel'
import WorkspaceChatPanel from './WorkspaceChatPanel'
import DocumentEditorChrome from '@/components/documents/DocumentEditorChrome'
import ExtensionAuthSync from './ExtensionAuthSync'

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { rightPanelOpen } = useSidebar()
  const pathname = usePathname()
  const onDocumentEditor = isDocumentEditorPath(pathname)
  const onSettings = isStandaloneSettingsPath(pathname)
  const showSidePanels = !onDocumentEditor && !onSettings

  return (
    <ChatPanelProvider>
      <InlineGuideProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar settingsMode={onSettings} />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <DocumentEditorChrome />
          <main
            className={
              onSettings
                ? 'min-h-0 flex-1 min-w-0 overflow-hidden'
                : 'scrollbar-minimal min-h-0 flex-1 min-w-0 overflow-y-auto'
            }
          >
            <WorkspaceMainContent>{children}</WorkspaceMainContent>
          </main>
        </div>

        {showSidePanels && (
          <AnimatePresence mode="sync">
            {rightPanelOpen && <RightContextPanel key="right-panel" />}
          </AnimatePresence>
        )}

        {!onSettings && <CommandPalette />}
        {showSidePanels && <WorkspaceChatPanel />}
        <InlineGuideOverlay />
        <InlineGuideResumeChip />
        <ExtensionAuthSync />
      </div>
      </InlineGuideProvider>
    </ChatPanelProvider>
  )
}
