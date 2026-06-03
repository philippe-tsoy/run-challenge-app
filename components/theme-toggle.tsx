"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  function select(next: Theme) {
    setTheme(next);
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        type="button"
        variant={theme === "light" ? "default" : "outline"}
        size="sm"
        className="flex-1 gap-2"
        onClick={() => select("light")}
        aria-pressed={theme === "light"}
      >
        <Sun className="size-4" aria-hidden />
        Light
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "outline"}
        size="sm"
        className="flex-1 gap-2"
        onClick={() => select("dark")}
        aria-pressed={theme === "dark"}
      >
        <Moon className="size-4" aria-hidden />
        Dark
      </Button>
    </div>
  );
}
