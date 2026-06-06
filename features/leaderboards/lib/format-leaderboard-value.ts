import { RANKING_MAP } from "@/features/challenges/lib/ranking-types";
import { formatPaceMinPerKm } from "@/lib/format/run-metrics";
import type { LeaderboardMode } from "@/lib/types/leaderboard";

export function formatLeaderboardValue(
  mode: LeaderboardMode,
  value: number,
): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const unit = RANKING_MAP[mode]?.unit ?? "";

  if (mode === "average_pace" || mode === "best_pace") {
    return formatPaceMinPerKm(safeValue);
  }

  if (mode === "run_count" || mode === "streak" || mode === "longest_streak") {
    return `${Math.round(safeValue)} ${unit}`;
  }

  if (mode === "social_score") {
    return `${Math.round(safeValue)} ${unit}`;
  }

  return `${safeValue.toFixed(1)} ${unit}`;
}
