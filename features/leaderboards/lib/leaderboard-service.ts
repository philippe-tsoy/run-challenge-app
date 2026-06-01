import type { SupabaseClient } from "@supabase/supabase-js";

import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import { toProfileDTO } from "@/lib/types/profile";
import type {
  LeaderboardDTO,
  LeaderboardEntryDTO,
  LeaderboardMode,
} from "@/lib/types/leaderboard";

type LeaderboardRow = {
  rank: number;
  user_id: string;
  username: string;
  value: number;
  achieved_at: string;
};

const RPC_BY_MODE: Record<LeaderboardMode, string> = {
  distance: "leaderboard_distance",
  run_count: "leaderboard_runs",
  average_pace: "leaderboard_average_pace",
  best_pace: "leaderboard_best_pace",
  streak: "leaderboard_streak",
  longest_streak: "leaderboard_longest_streak",
  social_score: "leaderboard_social_score",
};

async function getTeamDistanceKm(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("challenge_total_distance", {
    p_challenge_id: challengeId,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export async function getLeaderboard(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string,
  mode: LeaderboardMode,
): Promise<LeaderboardDTO> {
  const isMember = await isChallengeMember(supabase, challengeId, userId);
  if (!isMember) {
    throw Object.assign(new Error("NOT_CHALLENGE_MEMBER"), {
      code: "NOT_CHALLENGE_MEMBER",
    });
  }

  const rpcName = RPC_BY_MODE[mode];
  const { data, error } = await supabase.rpc(rpcName, {
    p_challenge_id: challengeId,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as LeaderboardRow[];
  const userIds = rows.map((row) => row.user_id);

  const profileMap = new Map<
    string,
    {
      id: string;
      username: string;
      email: string;
      display_name: string | null;
      avatar_url: string | null;
    }
  >();

  if (userIds.length) {
    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email, display_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      throw profilesError;
    }

    for (const profile of profileRows ?? []) {
      profileMap.set(profile.id, profile);
    }
  }

  const entries: LeaderboardEntryDTO[] = rows.map((row) => {
    const profile = profileMap.get(row.user_id) ?? null;

    return {
      rank: Number(row.rank),
      user: profile
        ? toProfileDTO(profile)
        : {
            id: row.user_id,
            username: row.username,
            displayName: null,
            avatarUrl: null,
          },
      value: Number(row.value),
      achievedAt: row.achieved_at,
    };
  });

  const teamTotalKm = await getTeamDistanceKm(supabase, challengeId);

  return {
    mode,
    entries,
    teamTotalKm,
  };
}
