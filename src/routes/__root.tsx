import { useState } from "react"
import { createRootRoute, Outlet } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="bg-background text-foreground flex h-svh w-full overflow-hidden">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
