import { useMatches } from "@tanstack/react-router"
import { Moon, Sun, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { navItems } from "@/lib/navigation"

type SiteHeaderProps = {
  onToggleSidebar: () => void
}

export function SiteHeader({ onToggleSidebar }: SiteHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const matches = useMatches()

  const activePath = matches.length ? matches[matches.length - 1].pathname : "/"
  const current = navItems.find((item) =>
    item.path === "/" ? activePath === "/" : activePath.startsWith(item.path),
  )
  const title = current?.title ?? "Pro Suite"

  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:px-6">
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold leading-none">{title}</h1>
        <p className="text-muted-foreground mt-1 text-xs leading-none">DetailFox Pro workspace</p>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      >
        <Sun className="hidden size-4 dark:block" />
        <Moon className="block size-4 dark:hidden" />
      </Button>
    </header>
  )
}
