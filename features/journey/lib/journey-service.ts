import type { SupabaseClient } from "@supabase/supabase-js";

import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import {
  resolveJourneyNodes,
  type DbJourneyNode,
} from "@/features/journey/lib/resolve-nodes";
import { LOTR_THEME } from "@/lib/constants/journey-nodes";
import type { JourneyDTO } from "@/lib/types/journey";

type LeaderboardRow = {
  rank: number;
  user_id: string;
  username: string;
  total_distance: number;
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

  return Number(data ?? 0);
}

async function getLeaderboardPreview(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string,
  limit: number,
): Promise<{
  preview: JourneyDTO["leaderboardPreview"];
  userRank: number | null;
  userDistanceKm: number;
}> {
  const { data, error } = await supabase.rpc("leaderboard_distance", {
    p_challenge_id: challengeId,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as LeaderboardRow[];
  const userDistanceKm = await getUserDistanceKm(supabase, challengeId, userId);
  const userRow = rows.find((row) => row.user_id === userId);
  const userRank = userRow ? Number(userRow.rank) : null;

  const topRows = rows.slice(0, limit);
  const userIds = topRows.map((row) => row.user_id);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const preview = topRows.map((row) => {
    const profile = profileMap.get(row.user_id);

    return {
      rank: Number(row.rank),
      userId: row.user_id,
      username: row.username,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      value: Number(row.total_distance),
    };
  });

  return { preview, userRank, userDistanceKm };
}

export async function getJourney(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string,
): Promise<JourneyDTO> {
  const isMember = await isChallengeMember(supabase, challengeId, userId);
  if (!isMember) {
    throw Object.assign(new Error("NOT_CHALLENGE_MEMBER"), {
      code: "NOT_CHALLENGE_MEMBER",
    });
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id, name, target_km, is_active, end_date, config")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge) {
    throw challengeError ?? new Error("Challenge not found");
  }

  const { data: dbNodes, error: nodesError } = await supabase
    .from("journey_nodes")
    .select(
      "id, name, description, km_marker, sort_order, image_url, map_x, map_y",
    )
    .eq("challenge_id", challengeId)
    .order("sort_order", { ascending: true });

  if (nodesError) {
    throw nodesError;
  }

  const teamDistanceKm = await getTeamDistanceKm(supabase, challengeId);
  const today = new Date().toISOString().slice(0, 10);
  const config =
    challenge.config && typeof challenge.config === "object"
      ? (challenge.config as Record<string, unknown>)
      : null;

  const resolved = resolveJourneyNodes(
    (dbNodes ?? []) as DbJourneyNode[],
    teamDistanceKm,
    config,
    {
      isActive: challenge.is_active,
      targetKm: Number(challenge.target_km),
      today,
      endDate: challenge.end_date,
    },
  );

  const { preview, userRank, userDistanceKm } = await getLeaderboardPreview(
    supabase,
    challengeId,
    userId,
    3,
  );

  return {
    challengeId: challenge.id,
    challengeName: challenge.name,
    isActive: challenge.is_active,
    teamDistanceKm,
    targetKm: Number(challenge.target_km),
    progressToNext: resolved.progressToNext,
    questComplete: resolved.questComplete,
    completionTitle: LOTR_THEME.completionTitle,
    completionMessage: LOTR_THEME.completionMessage,
    currentNode: resolved.currentNode,
    nextNode: resolved.nextNode,
    nodes: resolved.nodes,
    extendedNodes: resolved.extendedNodes,
    extendedUnlocked: resolved.extendedUnlocked,
    showExtendedMarkers: resolved.showExtendedMarkers,
    personalStats: {
      distanceKm: userDistanceKm,
      rank: userRank,
    },
    leaderboardPreview: preview,
  };
}
