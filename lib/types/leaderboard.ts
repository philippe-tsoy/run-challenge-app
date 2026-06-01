import type { ProfileDTO } from "@/lib/types/profile";

export type LeaderboardMode =
  | "distance"
  | "run_count"
  | "average_pace"
  | "best_pace"
  | "streak"
  | "longest_streak"
  | "social_score";

export type LeaderboardEntryDTO = {
  rank: number;
  user: ProfileDTO;
  value: number;
  achievedAt: string;
};

export type LeaderboardDTO = {
  mode: LeaderboardMode;
  entries: LeaderboardEntryDTO[];
  teamTotalKm: number;
};
