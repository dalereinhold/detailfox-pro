import { Monitor, Moon, Sun } from "lucide-react";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/components/theme-provider";

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

/**
 * Theme switcher meant to be nested inside another dropdown menu (e.g. the
 * account menu in the app header) rather than rendering its own trigger.
 */
export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme();
  const ActiveIcon = THEME_ICONS[theme];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ActiveIcon className="h-4 w-4" />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="rounded-md">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun className="h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="h-4 w-4" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
