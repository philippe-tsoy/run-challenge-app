import { createRun } from "@/features/runs/lib/api";
import {
  listPendingRuns,
  removePendingRun,
} from "@/lib/offline/queue";

export type OfflineSyncResult = {
  synced: number;
  failed: number;
  errors: string[];
};

export async function flushPendingRuns(): Promise<OfflineSyncResult> {
  const pending = await listPendingRuns();
  const result: OfflineSyncResult = {
    synced: 0,
    failed: 0,
    errors: [],
  };

  for (const record of pending) {
    try {
      await createRun(
        {
          challengeId: record.challengeId,
          distanceKm: record.distanceKm,
          durationMin: record.durationMin,
          notes: record.notes,
          source: "manual",
          adminOverride: false,
        },
        { idempotencyKey: record.clientOperationId },
      );

      await removePendingRun(record.clientOperationId);
      result.synced += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push(
        error instanceof Error ? error.message : "Failed to sync a pending run",
      );
    }
  }

  return result;
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
