import { SidebarProvider } from '@/lib/sidebar-context'
import WorkspaceSlugRedirect from '@/components/shell/WorkspaceSlugRedirect'
import WorkspaceShell from '@/components/shell/WorkspaceShell'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <WorkspaceSlugRedirect />
      <WorkspaceShell>
        {children}
      </WorkspaceShell>
    </SidebarProvider>
  )
}
