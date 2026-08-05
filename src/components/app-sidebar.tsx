import { Link } from "@tanstack/react-router"
import { PanelLeftClose, PanelLeftOpen, Boxes, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { navItems } from "@/lib/navigation"
import { Button } from "@/components/ui/Button"

type AppSidebarProps = {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onClose: () => void
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onClose }: AppSidebarProps) {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border flex h-svh shrink-0 flex-col border-r",
        // Mobile: fixed overlay, hidden by default, shown when mobileOpen
        "fixed inset-y-0 left-0 z-50 w-64",
        mobileOpen ? "flex" : "hidden",
        // Desktop: always visible, inline, collapsible width
        "md:relative md:flex md:z-auto",
        collapsed ? "md:w-16" : "md:w-64",
        "transition-[width] duration-200 ease-in-out",
      )}
    >
      <div
        className={cn(
          "border-sidebar-border flex h-14 items-center border-b px-3",
          collapsed ? "md:justify-center" : "md:justify-between",
          "justify-between",
        )}
      >
        {(!collapsed || mobileOpen) && (
          <Link to="/" className="flex items-center gap-2 overflow-hidden" onClick={onClose}>
            <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Boxes className="size-4" />
            </span>
            <span className="truncate text-sm font-semibold">DetailFox Pro</span>
          </Link>
        )}
        {/* Close button — mobile only */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close sidebar"
          className="text-sidebar-foreground md:hidden"
        >
          <X />
        </Button>
        {/* Collapse/expand button — desktop only */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-sidebar-foreground hidden md:flex"
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-label={item.title}
                  title={collapsed ? item.title : undefined}
                  onClick={onClose}
                  activeOptions={{ exact: item.path === "/" }}
                  className={cn(
                    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                    collapsed && "md:justify-center",
                  )}
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
                  }}
                >
                  <Icon className="size-4 shrink-0" />
                  {(!collapsed || mobileOpen) && <span className="truncate">{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-sidebar-border border-t p-3">
        <div
          className={cn(
            "text-sidebar-foreground/60 flex items-center gap-2 text-xs",
            collapsed && "md:justify-center",
          )}
        >
          <span className="bg-chart-2 size-2 shrink-0 rounded-full" aria-hidden="true" />
          {(!collapsed || mobileOpen) && <span className="truncate">All systems operational</span>}
        </div>
      </div>
    </aside>
  )
}
