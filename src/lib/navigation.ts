import { LayoutDashboard, Gauge, Workflow, ShoppingBag, type LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  path: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Pace Pro", path: "/pace-pro", icon: Gauge },
  { title: "Flow Pro", path: "/flow-pro", icon: Workflow },
  { title: "Store Pro", path: "/store-pro", icon: ShoppingBag },
]
