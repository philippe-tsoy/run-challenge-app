import type { SupabaseClient } from "@supabase/supabase-js";

import { listBadgeCatalog } from "@/features/badges/lib/badge-service";
import { getCurrentChallengeForUser } from "@/features/challenges/lib/challenge-service";
import { getLatestRunForUser } from "@/features/runs/lib/run-service";
import type { ProfileDTO } from "@/lib/types/profile";
import type { RunDTO } from "@/lib/types/run";

export type ProfileStatsDTO = {
  displayName: string | null;
  username: string;
  challengesJoined: number;
  badgesUnlocked: number;
  badgesTotal: number;
  currentChallenge: {
    id: string;
    name: string;
    distanceKm: number;
    rank: number | null;
    runsLogged: number;
  } | null;
  latestRun: RunDTO | null;
};

type LeaderboardRow = {
  rank: number;
  user_id: string;
};

async function getUserDistanceKm(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("user_total_distance", {
    p_challenge_id: challengeId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  const parsed = Number(data);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getUserRank(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("leaderboard_distance", {
    p_challenge_id: challengeId,
  });

  if (error) {
    throw error;
  }

  const row = ((data ?? []) as LeaderboardRow[]).find(
    (entry) => entry.user_id === userId,
  );

  return row ? Number(row.rank) : null;
}

export async function getProfileStats(
  supabase: SupabaseClient,
  userId: string,
  profile: ProfileDTO,
): Promise<ProfileStatsDTO> {
  const [
    { count: challengesJoined, error: challengesError },
    currentChallenge,
    badgeCatalog,
    latestRun,
  ] = await Promise.all([
    supabase
      .from("challenge_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    getCurrentChallengeForUser(supabase, userId),
    listBadgeCatalog(supabase, userId),
    getLatestRunForUser(supabase, userId),
  ]);

  if (challengesError) {
    throw challengesError;
  }

  let currentChallengeStats: ProfileStatsDTO["currentChallenge"] = null;

  if (currentChallenge) {
    const [distanceKm, rank, { count: runsLogged, error: runsError }] =
      await Promise.all([
        getUserDistanceKm(supabase, currentChallenge.id, userId),
        getUserRank(supabase, currentChallenge.id, userId),
        supabase
          .from("runs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("challenge_id", currentChallenge.id)
          .eq("is_valid", true),
      ]);

    if (runsError) {
      throw runsError;
    }

    currentChallengeStats = {
      id: currentChallenge.id,
      name: currentChallenge.name,
      distanceKm,
      rank,
      runsLogged: runsLogged ?? 0,
    };
  }

  const badgesUnlocked = badgeCatalog.filter((badge) => badge.unlocked).length;

  return {
    displayName: profile.displayName,
    username: profile.username,
    challengesJoined: challengesJoined ?? 0,
    badgesUnlocked,
    badgesTotal: badgeCatalog.length,
    currentChallenge: currentChallengeStats,
    latestRun,
  };
}
