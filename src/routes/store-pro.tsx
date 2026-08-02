import { createFileRoute } from "@tanstack/react-router"
import { ShoppingBag } from "lucide-react"

import { EmptyState } from "@/components/empty-state"

export const Route = createFileRoute("/store-pro")({
  component: StoreProPage,
})

function StoreProPage() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Store Pro detailer inventory."
      message="Component comming soon."
    />
  )
}
