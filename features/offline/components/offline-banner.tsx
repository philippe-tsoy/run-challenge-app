"use client";

import { useOnlineStatus } from "@/features/offline/hooks/use-online-status";
import { usePendingRuns } from "@/features/offline/hooks/use-pending-runs";
import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { data: challenge } = useCurrentChallenge();
  const { pendingRuns } = usePendingRuns(challenge?.id ?? "");

  if (isOnline && !pendingRuns.length) {
    return null;
  }

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
      role="status"
    >
      {!isOnline ? (
        <span>You are offline. Runs will sync when you reconnect.</span>
      ) : (
        <span>
          Syncing {pendingRuns.length} pending run
          {pendingRuns.length === 1 ? "" : "s"}…
        </span>
      )}
    </div>
  );
}
