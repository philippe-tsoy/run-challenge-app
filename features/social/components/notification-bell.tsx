"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUnreadNotificationCount } from "@/features/social/hooks/use-notifications";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  variant?: "text" | "icon";
};

export function NotificationBell({ variant = "text" }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const badge =
    unreadCount > 0 ? (
      <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-semibold leading-none">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    ) : null;

  if (variant === "icon") {
    return (
      <Button variant="ghost" size="icon" className="relative" asChild>
        <Link href="/app/notifications" aria-label="Notifications">
          <Bell className="size-5" aria-hidden />
          {badge}
        </Link>
      </Button>
    );
  }

  return (
    <Link
      href="/app/notifications"
      className={cn(
        "text-muted-foreground hover:text-foreground relative text-sm font-medium underline-offset-4 hover:underline",
      )}
    >
      Notifications
      {unreadCount > 0 ? (
        <span className="bg-primary text-primary-foreground absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
