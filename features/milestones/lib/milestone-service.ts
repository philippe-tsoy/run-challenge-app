import type { SupabaseClient } from "@supabase/supabase-js";

import { getCelebrationForNode } from "@/features/milestones/lib/celebration";
import { getJourneyImageForNodeName } from "@/lib/constants/journey-images";
import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import type { JourneyNodeOption, MilestoneDTO } from "@/lib/types/milestone";
import { createServiceRoleClient } from "@/lib/supabase/server";

type MilestoneRow = {
  id: string;
  challenge_id: string;
  journey_node_id: string;
  triggered_at: string;
  journey_nodes: {
    name: string;
    km_marker: number;
    description: string | null;
  } | {
    name: string;
    km_marker: number;
    description: string | null;
  }[];
};

function extractNode(
  node: MilestoneRow["journey_nodes"],
): { name: string; km_marker: number; description: string | null } {
  return Array.isArray(node) ? node[0] : node;
}

function mapMilestoneRow(row: MilestoneRow): MilestoneDTO {
  const node = extractNode(row.journey_nodes);
  const celebration = getCelebrationForNode(
    node.name,
    Number(node.km_marker),
    node.description,
  );

  return {
    id: row.id,
    challengeId: row.challenge_id,
    journeyNodeId: row.journey_node_id,
    nodeName: node.name,
    kmMarker: Number(node.km_marker),
    triggeredAt: row.triggered_at,
    title: celebration.title,
    message: celebration.message,
    confetti: celebration.confetti,
    imageUrl: getJourneyImageForNodeName(node.name) || null,
  };
}

export async function listMilestones(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string,
): Promise<MilestoneDTO[]> {
  const isMember = await isChallengeMember(supabase, challengeId, userId);
  if (!isMember) {
    throw Object.assign(new Error("NOT_CHALLENGE_MEMBER"), {
      code: "NOT_CHALLENGE_MEMBER",
    });
  }

  const { data, error } = await supabase
    .from("challenge_milestones")
    .select(
      "id, challenge_id, journey_node_id, triggered_at, journey_nodes(name, km_marker, description)",
    )
    .eq("challenge_id", challengeId)
    .order("triggered_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapMilestoneRow(row as MilestoneRow));
}

export async function listJourneyNodesForChallenge(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<JourneyNodeOption[]> {
  const { data, error } = await supabase
    .from("journey_nodes")
    .select("id, name, km_marker")
    .eq("challenge_id", challengeId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((node) => ({
    id: node.id,
    name: node.name,
    kmMarker: Number(node.km_marker),
  }));
}

async function createMilestoneFeedEvent(
  challengeId: string,
  journeyNodeId: string,
  milestone: MilestoneDTO,
  actorUserId: string,
): Promise<void> {
  const admin = createServiceRoleClient();

  const { error } = await admin.from("feed_events").insert({
    challenge_id: challengeId,
    actor_user_id: actorUserId,
    event_type: "milestone_reached",
    entity_type: "journey_node",
    entity_id: journeyNodeId,
    payload: {
      nodeId: journeyNodeId,
      nodeName: milestone.nodeName,
      kmMarker: milestone.kmMarker,
      title: milestone.title,
      message: milestone.message,
      imageUrl: milestone.imageUrl,
    },
  });

  if (error) {
    throw error;
  }
}

export async function forceMilestone(
  supabase: SupabaseClient,
  actorUserId: string,
  challengeId: string,
  journeyNodeId: string,
): Promise<MilestoneDTO> {
  const { data: node, error: nodeError } = await supabase
    .from("journey_nodes")
    .select("id, name, km_marker, description, challenge_id")
    .eq("id", journeyNodeId)
    .maybeSingle();

  if (nodeError) {
    throw nodeError;
  }

  if (!node || node.challenge_id !== challengeId) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  const celebration = getCelebrationForNode(
    node.name,
    Number(node.km_marker),
    node.description,
  );

  const milestonePreview: MilestoneDTO = {
    id: "",
    challengeId,
    journeyNodeId,
    nodeName: node.name,
    kmMarker: Number(node.km_marker),
    triggeredAt: new Date().toISOString(),
    title: celebration.title,
    message: celebration.message,
    confetti: celebration.confetti,
    imageUrl: getJourneyImageForNodeName(node.name) || null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("challenge_milestones")
    .insert({
      challenge_id: challengeId,
      journey_node_id: journeyNodeId,
    })
    .select(
      "id, challenge_id, journey_node_id, triggered_at, journey_nodes(name, km_marker, description)",
    )
    .maybeSingle();

  if (insertError) {
    throw insertError;
  }

  if (inserted) {
    return mapMilestoneRow(inserted as MilestoneRow);
  }

  const { data: existing, error: existingError } = await supabase
    .from("challenge_milestones")
    .select(
      "id, challenge_id, journey_node_id, triggered_at, journey_nodes(name, km_marker, description)",
    )
    .eq("challenge_id", challengeId)
    .eq("journey_node_id", journeyNodeId)
    .single();

  if (existingError || !existing) {
    throw existingError ?? new Error("Failed to force milestone");
  }

  const milestone = mapMilestoneRow(existing as MilestoneRow);
  await createMilestoneFeedEvent(
    challengeId,
    journeyNodeId,
    milestone,
    actorUserId,
  );

  return milestone;
}
