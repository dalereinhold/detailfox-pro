import { useState } from "react"
import { createRootRoute, Outlet } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggleSidebar = () => {
    // Check if on mobile view (< 768px matching Tailwind's md breakpoint)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => !prev)
    }
  }

  return (
    <div className="bg-background text-foreground flex h-svh w-full overflow-hidden">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}