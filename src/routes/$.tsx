import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  component: NotFound,
});

function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <Compass className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight">404</h1>
        <p className="text-sm text-muted-foreground">
          This page doesn't exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}
