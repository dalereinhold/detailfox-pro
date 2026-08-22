import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/client";
import { UserMenu } from "@/components/auth/user-menu";

export const Route = createFileRoute("/_auth")({
  component: AuthRoute,
});

function AuthRoute() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const client = createClient();
      const { data, error } = await client.auth.getUser();

      if (error) {
        location.href = "/login";
        return;
      }
      setUser(data.user);
    };
    checkAuth();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="space-y-0.5">
          <h1 className="text-lg font-semibold tracking-tight">
            DetailFox Pro{" "}
            <span className="text-base font-normal text-muted-foreground">
              / Pace Pro
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Pace stats & metrics • Vehicle intake and tracker
          </p>
        </div>
        <UserMenu user={user} />
      </header>

      {/* Main Full-Width Content Container */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Sticky Bottom Footer */}
      <footer className="flex flex-col gap-4 border-t border-border/40 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} DetailFox Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
