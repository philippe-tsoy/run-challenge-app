"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { usePendingRuns } from "@/features/offline/hooks/use-pending-runs";
import { useRuns } from "@/features/runs/hooks/use-runs";
import { computePaceMinPerKm } from "@/lib/validators/run";

type RunListProps = {
  challengeId: string;
  userId?: string;
};

export function RunList({ challengeId, userId }: RunListProps) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRuns(challengeId, userId);
  const { pendingRuns } = usePendingRuns(challengeId);

  const runs = data?.pages.flatMap((page) => page.runs) ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading runs...</p>;
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load runs"}
      </p>
    );
  }

  if (!runs.length && !pendingRuns.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No runs logged yet. Tap Log run to add your first entry.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRuns.map((pending) => {
        const pace = computePaceMinPerKm(
          pending.distanceKm,
          pending.durationMin,
        );

        return (
          <article
            key={pending.clientOperationId}
            className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 p-4 shadow-sm"
          >
            <p className="text-xs font-medium tracking-wide text-amber-800 uppercase">
              Pending sync
            </p>
            <p className="mt-1 font-medium">
              {pending.distanceKm.toFixed(2)} km · {pending.durationMin} min
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {pace.toFixed(2)} min/km · queued{" "}
              {new Date(pending.queuedAt).toLocaleString()}
            </p>
          </article>
        );
      })}

      {runs.map((run) => {
        const pace = computePaceMinPerKm(run.distanceKm, run.durationMin);

        return (
          <Link
            key={run.id}
            href={`/app/runs/${run.id}/edit`}
            className="bg-card hover:bg-accent/40 block rounded-xl border p-4 shadow-sm transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {run.distanceKm.toFixed(2)} km · {run.durationMin} min
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {pace.toFixed(2)} min/km · @{run.user.username}
                </p>
              </div>
              {!run.isValid ? (
                <span className="text-destructive text-xs font-medium">
                  Invalid
                </span>
              ) : null}
            </div>
            {run.notes ? (
              <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                {run.notes}
              </p>
            ) : null}
          </Link>
        );
      })}

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
