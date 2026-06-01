"use client";

import { useQuery } from "@tanstack/react-query";

import { getLeaderboard } from "@/features/leaderboards/lib/api";
import type { LeaderboardMode } from "@/lib/types/leaderboard";

export function useLeaderboard(challengeId: string, mode: LeaderboardMode) {
  return useQuery({
    queryKey: ["leaderboard", challengeId, mode],
    queryFn: () => getLeaderboard(challengeId, mode),
    enabled: Boolean(challengeId),
  });
}
