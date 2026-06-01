"use client";

import { useCallback, useEffect, useState } from "react";

import { listPendingRuns } from "@/lib/offline/queue";
import type { PendingRunRecord } from "@/lib/offline/types";

export function usePendingRuns(challengeId: string) {
  const [pendingRuns, setPendingRuns] = useState<PendingRunRecord[]>([]);

  const refresh = useCallback(async () => {
    try {
      const records = await listPendingRuns(challengeId);
      setPendingRuns(records);
    } catch {
      setPendingRuns([]);
    }
  }, [challengeId]);

  useEffect(() => {
    void refresh();

    window.addEventListener("pending-runs-updated", refresh);
    return () => window.removeEventListener("pending-runs-updated", refresh);
  }, [refresh]);

  return { pendingRuns, refresh };
}

export function notifyPendingRunsUpdated() {
  window.dispatchEvent(new Event("pending-runs-updated"));
}
