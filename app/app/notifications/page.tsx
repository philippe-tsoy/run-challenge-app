import Link from "next/link";

import { NotificationList } from "@/features/social/components/notification-list";

export default function NotificationsPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <div>
        <Link
          href="/app"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
      </div>

      <NotificationList />
    </main>
  );
}
