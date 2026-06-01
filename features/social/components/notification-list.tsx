"use client";

import { Button } from "@/components/ui/button";
import {
  useMarkNotificationsRead,
  useNotifications,
} from "@/features/social/hooks/use-notifications";

function formatNotification(message: {
  type: string;
  payload: Record<string, unknown>;
}): string {
  switch (message.type) {
    case "run_comment":
      return "Someone commented on your run";
    case "run_reaction":
      return "Someone reacted to your run";
    case "badge_unlocked":
      return "You unlocked a badge";
    case "milestone_reached":
      return "The fellowship reached a milestone";
    case "challenge_completed":
      return "Challenge completed";
    default:
      return message.type.replaceAll("_", " ");
  }
}

export function NotificationList() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications(false);
  const markRead = useMarkNotificationsRead();

  const notifications =
    data?.pages.flatMap((page) => page.notifications) ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading notifications...</p>;
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load notifications"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={markRead.isPending}
          onClick={() => markRead.mutate({ all: true })}
        >
          Mark all read
        </Button>
      </div>

      {!notifications.length ? (
        <section className="bg-card rounded-xl border p-6 text-center shadow-sm">
          <p className="font-medium">All caught up</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Notifications appear when someone interacts with your runs.
          </p>
        </section>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`rounded-xl border p-4 shadow-sm ${
                notification.isRead ? "bg-card" : "bg-accent/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">
                  {formatNotification(notification)}
                </p>
                <time className="text-muted-foreground shrink-0 text-xs">
                  {new Date(notification.createdAt).toLocaleString()}
                </time>
              </div>
              {!notification.isRead ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 min-h-8 px-2"
                  onClick={() => markRead.mutate({ ids: [notification.id] })}
                >
                  Mark read
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {hasNextPage ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
