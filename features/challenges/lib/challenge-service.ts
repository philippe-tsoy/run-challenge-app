import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_EXTENDED_JOURNEY_NODES } from "@/lib/constants/extended-journey-nodes";
import { LOTR_THEME } from "@/lib/constants/journey-nodes";
import type {
  ChallengeDetailDTO,
  ChallengeDTO,
  ChallengeRow,
} from "@/lib/types/challenge";
import { writeAuditLog } from "@/lib/admin/audit-log";
import type {
  CreateChallengeInput,
  ChallengeStatusFilter,
  UpdateChallengeInput,
} from "@/lib/validators/challenge";

const DEFAULT_CHALLENGE_CONFIG = {
  allowPhotos: true,
  maxPhotos: 3,
  enableBadges: true,
  enableLeaderboards: true,
  enableJourneySystem: true,
  enableComments: true,
  enableReactions: true,
  extended_nodes: DEFAULT_EXTENDED_JOURNEY_NODES,
} as const;

type ChallengeThemeRelation = { code: string } | { code: string }[] | null;

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

async function getProgressPercent(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("challenge_progress_percent", {
    p_challenge_id: challengeId,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

function toChallengeDTO(
  row: ChallengeRow,
  teamDistanceKm: number,
): ChallengeDTO {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    targetKm: Number(row.target_km),
    isActive: row.is_active,
    teamDistanceKm,
  };
}

export async function mapChallengeToDTO(
  supabase: SupabaseClient,
  row: ChallengeRow,
): Promise<ChallengeDTO> {
  const teamDistanceKm = await getTeamDistanceKm(supabase, row.id);
  return toChallengeDTO(row, teamDistanceKm);
}

export async function isChallengeMember(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function deactivateActiveChallenges(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase
    .from("challenges")
    .update({ is_active: false })
    .eq("is_active", true);

  if (error) {
    throw error;
  }
}

function buildJourneyNodeRows(challengeId: string) {
  return LOTR_THEME.nodes.map((node) => ({
    challenge_id: challengeId,
    name: node.name,
    description: `${node.subtitle}. ${node.description}`,
    km_marker: node.kmMarker,
    sort_order: node.order,
    image_url: node.image,
    map_x: node.map.x,
    map_y: node.map.y,
  }));
}

async function enrollAllUsers(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<void> {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id");

  if (profilesError) {
    throw profilesError;
  }

  if (!profiles?.length) {
    return;
  }

  const rows = profiles.map((profile) => ({
    challenge_id: challengeId,
    user_id: profile.id,
  }));

  const { error } = await supabase.from("challenge_members").insert(rows);

  if (error) {
    throw error;
  }
}

async function seedJourneyNodes(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<void> {
  const { error } = await supabase
    .from("journey_nodes")
    .insert(buildJourneyNodeRows(challengeId));

  if (error) {
    throw error;
  }
}

async function getThemeId(
  supabase: SupabaseClient,
  themeCode: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("challenge_themes")
    .select("id")
    .eq("code", themeCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function createChallenge(
  supabase: SupabaseClient,
  input: CreateChallengeInput,
  createdBy: string,
): Promise<ChallengeDTO> {
  await deactivateActiveChallenges(supabase);

  const themeId = await getThemeId(supabase, input.themeCode);
  if (!themeId) {
    throw new Error(`Unknown theme code: ${input.themeCode}`);
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .insert({
      theme_id: themeId,
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate,
      target_km: input.targetKm,
      is_active: true,
      config: DEFAULT_CHALLENGE_CONFIG,
      created_by: createdBy,
    })
    .select("id, name, start_date, end_date, target_km, is_active, theme_id, config")
    .single();

  if (challengeError || !challenge) {
    if (challengeError?.code === "23505") {
      throw Object.assign(new Error("ACTIVE_CHALLENGE_EXISTS"), {
        code: "ACTIVE_CHALLENGE_EXISTS",
      });
    }
    throw challengeError ?? new Error("Failed to create challenge");
  }

  try {
    await seedJourneyNodes(supabase, challenge.id);
    await enrollAllUsers(supabase, challenge.id);
  } catch (error) {
    await supabase.from("challenges").delete().eq("id", challenge.id);
    throw error;
  }

  return mapChallengeToDTO(supabase, challenge);
}

export async function updateChallenge(
  supabase: SupabaseClient,
  challengeId: string,
  input: UpdateChallengeInput,
): Promise<ChallengeDTO> {
  if (input.isActive === true) {
    await deactivateActiveChallenges(supabase);
  }

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) updates.name = input.name;
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.endDate !== undefined) updates.end_date = input.endDate;
  if (input.targetKm !== undefined) updates.target_km = input.targetKm;
  if (input.isActive !== undefined) updates.is_active = input.isActive;
  if (input.config !== undefined) updates.config = input.config;

  const { data, error } = await supabase
    .from("challenges")
    .update(updates)
    .eq("id", challengeId)
    .select("id, name, start_date, end_date, target_km, is_active, theme_id, config")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw Object.assign(new Error("ACTIVE_CHALLENGE_EXISTS"), {
        code: "ACTIVE_CHALLENGE_EXISTS",
      });
    }
    throw error ?? new Error("Failed to update challenge");
  }

  return mapChallengeToDTO(supabase, data);
}

function matchesStatusFilter(
  challenge: ChallengeRow,
  status: ChallengeStatusFilter,
): boolean {
  const today = new Date().toISOString().slice(0, 10);

  if (status === "active") {
    return challenge.is_active;
  }

  if (status === "completed") {
    return !challenge.is_active || challenge.end_date < today;
  }

  return true;
}

export async function listChallengesForUser(
  supabase: SupabaseClient,
  userId: string,
  status: ChallengeStatusFilter = "all",
): Promise<ChallengeDTO[]> {
  const { data, error } = await supabase
    .from("challenge_members")
    .select(
      "challenges!inner(id, name, start_date, end_date, target_km, is_active, theme_id, config)",
    )
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const rows = (data ?? [])
    .map((row) => {
      const challenge = row.challenges;
      return Array.isArray(challenge) ? challenge[0] : challenge;
    })
    .filter((challenge): challenge is ChallengeRow => Boolean(challenge))
    .filter((challenge) => matchesStatusFilter(challenge, status))
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  return Promise.all(rows.map((row) => mapChallengeToDTO(supabase, row)));
}

export async function getCurrentChallengeForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ChallengeDTO | null> {
  const activeChallenges = await listChallengesForUser(
    supabase,
    userId,
    "active",
  );

  return activeChallenges[0] ?? null;
}

export async function getChallengeDetail(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<ChallengeDetailDTO | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select(
      "id, name, start_date, end_date, target_km, is_active, theme_id, config, challenge_themes(code)",
    )
    .eq("id", challengeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as ChallengeRow & {
    challenge_themes: ChallengeThemeRelation;
  };
  const base = await mapChallengeToDTO(supabase, row);
  const themeRelation = row.challenge_themes;
  const themeCode = Array.isArray(themeRelation)
    ? (themeRelation[0]?.code ?? null)
    : (themeRelation?.code ?? null);

  const [
    progressPercent,
    { count: participantCount, error: participantsError },
    { count: journeyNodeCount, error: nodesError },
  ] = await Promise.all([
    getProgressPercent(supabase, challengeId),
    supabase
      .from("challenge_members")
      .select("*", { count: "exact", head: true })
      .eq("challenge_id", challengeId),
    supabase
      .from("journey_nodes")
      .select("*", { count: "exact", head: true })
      .eq("challenge_id", challengeId),
  ]);

  if (participantsError) {
    throw participantsError;
  }

  if (nodesError) {
    throw nodesError;
  }

  return {
    ...base,
    progressPercent,
    participantCount: participantCount ?? 0,
    journeyNodeCount: journeyNodeCount ?? 0,
    themeCode,
  };
}

export async function closeChallengeEarly(
  supabase: SupabaseClient,
  challengeId: string,
  actorUserId: string,
): Promise<ChallengeDTO> {
  const existing = await getChallengeDetail(supabase, challengeId);
  if (!existing) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const updates: Record<string, unknown> = { is_active: false };
  if (existing.endDate > today) {
    updates.end_date = today;
  }

  const { data, error } = await supabase
    .from("challenges")
    .update(updates)
    .eq("id", challengeId)
    .select(
      "id, name, start_date, end_date, target_km, is_active, theme_id, config",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to close challenge");
  }

  await writeAuditLog({
    actorUserId,
    action: "challenge_close_early",
    entityType: "challenge",
    entityId: challengeId,
    payload: {
      previous_end_date: existing.endDate,
      end_date: updates.end_date ?? existing.endDate,
    },
  });

  return mapChallengeToDTO(supabase, data);
}
