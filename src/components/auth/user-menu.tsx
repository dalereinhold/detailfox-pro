import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, LogOut } from "lucide-react";

import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeMenuItems } from "@/components/theme-toggle";

interface UserMenuProps {
  user: User | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const email = user?.email ?? "Account";
  const initial = email.charAt(0).toUpperCase();

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await createClient().auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-lg pl-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {initial}
          </span>
          <span className="max-w-40 truncate">{email}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-md">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeMenuItems />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
