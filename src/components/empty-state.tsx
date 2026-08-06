import type { LucideIcon } from "lucide-react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  message: string
  actionLabel?: string
}

export function EmptyState({ icon: Icon, title, message, actionLabel }: EmptyStateProps) {
  return (
    <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <span
            className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-xl"
            aria-hidden="true"
          >
            <Icon className="size-6" />
          </span>
          <CardTitle className="mt-4 text-base">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {actionLabel && (
          <CardContent className="flex justify-center">
            <Button>
              <Plus className="size-4" />
              {actionLabel}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
