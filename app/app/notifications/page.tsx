import { NotificationList } from "@/features/social/components/notification-list";

export default function NotificationsPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
      </header>

      <NotificationList />
    </main>
  );
}
