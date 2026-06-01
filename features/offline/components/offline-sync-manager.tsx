"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import { notifyPendingRunsUpdated } from "@/features/offline/hooks/use-pending-runs";
import { useOnlineStatus } from "@/features/offline/hooks/use-online-status";
import { invalidateRunRelatedQueries } from "@/features/runs/lib/query-keys";
import { flushPendingRuns } from "@/lib/offline/sync";

export function OfflineSyncManager() {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const { data: challenge } = useCurrentChallenge();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isOnline || isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;

    void flushPendingRuns()
      .then((result) => {
        notifyPendingRunsUpdated();
        if (challenge?.id && result.synced > 0) {
          invalidateRunRelatedQueries(queryClient, challenge.id);
        }
      })
      .finally(() => {
        isSyncingRef.current = false;
      });
  }, [isOnline, challenge?.id, queryClient]);

  return null;
}
