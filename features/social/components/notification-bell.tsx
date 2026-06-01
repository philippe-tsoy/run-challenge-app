"use client";

import Link from "next/link";

import { useUnreadNotificationCount } from "@/features/social/hooks/use-notifications";

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <Link
      href="/app/notifications"
      className="text-muted-foreground hover:text-foreground relative text-sm font-medium underline-offset-4 hover:underline"
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
