"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import {
  useStravaDisconnect,
  useStravaImport,
  useStravaStatus,
} from "@/features/strava/hooks/use-strava";
import type { StravaImportResultDTO } from "@/lib/types/strava";

export function StravaSettings() {
  const searchParams = useSearchParams();
  const { data: challenge } = useCurrentChallenge();
  const { data: status, isLoading, refetch } = useStravaStatus();
  const importMutation = useStravaImport(challenge?.id ?? "");
  const disconnectMutation = useStravaDisconnect();
  const [message, setMessage] = useState<string | null>(null);
  const [importSummary, setImportSummary] =
    useState<StravaImportResultDTO | null>(null);

  useEffect(() => {
    const stravaParam = searchParams.get("strava");
    const errorMessage = searchParams.get("message");

    if (stravaParam === "connected") {
      setMessage("Strava connected successfully.");
      void refetch();
    } else if (stravaParam === "error" && errorMessage) {
      setMessage(errorMessage);
    }
  }, [searchParams, refetch]);

  async function handleImport() {
    if (!challenge?.id) {
      setMessage("Join an active challenge before importing runs.");
      return;
    }

    setMessage(null);
    setImportSummary(null);

    try {
      const result = await importMutation.mutateAsync({});
      setImportSummary(result);
      setMessage(
        `Imported ${result.imported} run${result.imported === 1 ? "" : "s"} from Strava.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to import from Strava",
      );
    }
  }

  async function handleDisconnect() {
    setMessage(null);
    try {
      await disconnectMutation.mutateAsync();
      setMessage("Strava disconnected.");
      setImportSummary(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to disconnect Strava",
      );
    }
  }

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading Strava status...</p>
    );
  }

  if (!status?.configured) {
    return (
      <section className="bg-card space-y-3 rounded-xl border p-6 shadow-sm">
        <h2 className="font-medium">Strava</h2>
        <p className="text-muted-foreground text-sm">
          Strava is not configured on this server. Add{" "}
          <code className="text-xs">STRAVA_CLIENT_ID</code> and{" "}
          <code className="text-xs">STRAVA_CLIENT_SECRET</code> to your
          environment.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
      <div>
        <h2 className="font-medium">Strava</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Import running activities only (no walks or hikes). Duplicates are
          skipped automatically.
        </p>
      </div>

      {status.connected ? (
        <p className="text-sm">
          Connected as athlete #{status.athleteId}
          {status.tokenExpiresAt
            ? ` · token refreshes before ${new Date(status.tokenExpiresAt).toLocaleString()}`
            : ""}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Not connected</p>
      )}

      <div className="flex flex-wrap gap-3">
        {status.connected ? (
          <>
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending || !challenge?.id}
            >
              {importMutation.isPending ? "Importing..." : "Import recent runs"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link href="/api/strava/connect">Connect Strava</Link>
          </Button>
        )}
      </div>

      {message ? <p className="text-sm">{message}</p> : null}

      {importSummary ? (
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>Imported: {importSummary.imported}</li>
          <li>Duplicates skipped: {importSummary.skippedDuplicates}</li>
          <li>Already imported: {importSummary.skippedAlreadyImported}</li>
          <li>Non-run activities: {importSummary.skippedNonRun}</li>
          <li>Invalid pace: {importSummary.skippedInvalid}</li>
        </ul>
      ) : null}
    </section>
  );
}
