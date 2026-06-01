import { RANKING_MAP } from "@/features/challenges/lib/ranking-types";
import type { LeaderboardMode } from "@/lib/types/leaderboard";

export function formatLeaderboardValue(
  mode: LeaderboardMode,
  value: number,
): string {
  const unit = RANKING_MAP[mode]?.unit ?? "";

  if (mode === "average_pace" || mode === "best_pace") {
    return `${value.toFixed(2)} ${unit}`;
  }

  if (mode === "run_count" || mode === "streak" || mode === "longest_streak") {
    return `${Math.round(value)} ${unit}`;
  }

  if (mode === "social_score") {
    return `${Math.round(value)} ${unit}`;
  }

  return `${value.toFixed(1)} ${unit}`;
}
