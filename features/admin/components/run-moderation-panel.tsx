"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  invalidateRun,
  restoreRun,
} from "@/features/admin/lib/api";
import { getCurrentChallenge } from "@/features/challenges/lib/api";
import { deleteRun, listRuns } from "@/features/runs/lib/api";
import {
  invalidateRunRelatedQueries,
  runQueryKeys,
} from "@/features/runs/lib/query-keys";

export function RunModerationPanel() {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("Policy violation");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: challenge } = useQuery({
    queryKey: ["challenge", "current"],
    queryFn: getCurrentChallenge,
  });

  const challengeId = challenge?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: runQueryKeys.list(challengeId ?? ""),
    queryFn: () =>
      listRuns({ challengeId: challengeId!, limit: 30 }),
    enabled: Boolean(challengeId),
  });

  async function invalidateQueries() {
    if (!challengeId) {
      return;
    }
    invalidateRunRelatedQueries(queryClient, challengeId);
    await queryClient.invalidateQueries({
      queryKey: runQueryKeys.list(challengeId),
    });
  }

  const invalidateMutation = useMutation({
    mutationFn: (runId: string) => invalidateRun(runId, reason),
    onSuccess: invalidateQueries,
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : "Invalidate failed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreRun,
    onSuccess: invalidateQueries,
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : "Restore failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRun,
    onSuccess: invalidateQueries,
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : "Delete failed");
    },
  });

  const runs = data?.runs ?? [];

  if (!challengeId) {
    return (
      <p className="text-muted-foreground text-sm">
        No active challenge — select or create one first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="invalidate-reason">Invalidate reason</Label>
        <Input
          id="invalidate-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      {actionError ? (
        <p className="text-destructive text-sm">{actionError}</p>
      ) : null}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading runs…</p>
      ) : error ? (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Failed to load runs"}
        </p>
      ) : runs.length === 0 ? (
        <p className="text-muted-foreground text-sm">No runs in this challenge.</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {runs.map((run) => (
            <li key={run.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {run.user.displayName ?? run.user.username} · {run.distanceKm}{" "}
                    km
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(run.createdAt).toLocaleString()} ·{" "}
                    {run.isValid ? "Valid" : "Invalid"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {run.isValid ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={invalidateMutation.isPending || !reason.trim()}
                    onClick={() => invalidateMutation.mutate(run.id)}
                  >
                    Invalidate
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(run.id)}
                  >
                    Restore
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Hard-delete this run? This cannot be undone.",
                      )
                    ) {
                      deleteMutation.mutate(run.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
