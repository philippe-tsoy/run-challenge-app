"use client";

import { useState } from "react";

import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import {
  LEADERBOARD_TABS,
  RANKING_MAP,
} from "@/features/challenges/lib/ranking-types";
import { useLeaderboard } from "@/features/leaderboards/hooks/use-leaderboard";
import { formatLeaderboardValue } from "@/features/leaderboards/lib/format-leaderboard-value";
import type { LeaderboardMode } from "@/lib/types/leaderboard";

export function LeaderboardView() {
  const { data: challenge, isLoading: challengeLoading } = useCurrentChallenge();
  const [mode, setMode] = useState<LeaderboardMode>("distance");
  const challengeId = challenge?.id ?? "";

  const { data, isLoading, error } = useLeaderboard(challengeId, mode);

  if (challengeLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading challenge...</p>
    );
  }

  if (!challenge) {
    return (
      <p className="text-muted-foreground text-sm">
        No active challenge. Join a challenge to view leaderboards.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboards</h1>
        <p className="text-muted-foreground text-sm">
          Team total:{" "}
          <span className="text-foreground font-medium">
            {(data?.teamTotalKm ?? challenge.teamDistanceKm).toFixed(1)} km
          </span>
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {LEADERBOARD_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={
              mode === tab
                ? "bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm"
                : "bg-muted text-muted-foreground hover:text-foreground rounded-full px-3 py-1 text-sm"
            }
          >
            {RANKING_MAP[tab]?.name ?? tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading rankings...</p>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Failed to load leaderboard"}
        </p>
      ) : null}

      {data?.entries.length ? (
        <ol className="bg-card divide-y rounded-xl border shadow-sm">
          {data.entries.map((entry) => (
            <li
              key={entry.user.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-6 text-center text-sm font-medium tabular-nums">
                  {entry.rank}
                </span>
                <div>
                  <p className="font-medium">
                    {entry.user.displayName ?? entry.user.username}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    @{entry.user.username}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {formatLeaderboardValue(mode, entry.value)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        !isLoading &&
        !error && (
          <p className="text-muted-foreground text-sm">
            No rankings for this mode yet. Log a run to appear here.
          </p>
        )
      )}
    </div>
  );
}
