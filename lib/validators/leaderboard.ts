import { z } from "zod";

import { LEADERBOARD_TABS } from "@/features/challenges/lib/ranking-types";

export const leaderboardModeSchema = z.enum(LEADERBOARD_TABS);

export const getLeaderboardQuerySchema = z.object({
  challengeId: z.string().uuid(),
  mode: leaderboardModeSchema.default("distance"),
});

export type GetLeaderboardQuery = z.infer<typeof getLeaderboardQuerySchema>;
