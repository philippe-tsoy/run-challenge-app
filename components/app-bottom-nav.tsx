"use client";

import Link from "next/link";
import { Map, Newspaper, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/app/leaderboards",
    label: "Boards",
    icon: Trophy,
    isActive: (pathname: string) => pathname.startsWith("/app/leaderboards"),
  },
  {
    href: "/app",
    label: "Journey",
    icon: Map,
    isActive: (pathname: string) => pathname === "/app",
    emphasize: true,
  },
  {
    href: "/app/feed",
    label: "Feed",
    icon: Newspaper,
    isActive: (pathname: string) => pathname.startsWith("/app/feed"),
  },
] as const;

type AppBottomNavProps = {
  pathname: string;
};

export function AppBottomNav({ pathname }: AppBottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="border-border/80 bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex h-14 max-w-2xl items-stretch px-2">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-muted-foreground hover:text-foreground flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-medium transition-colors",
                active && "text-primary",
                "emphasize" in tab && tab.emphasize && active && "font-semibold",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  "emphasize" in tab && tab.emphasize && "size-6",
                  active && "text-primary",
                )}
                aria-hidden
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
