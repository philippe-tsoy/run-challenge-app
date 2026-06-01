import {
  FEED_EVENT_TYPES,
  type FeedActor,
  type FeedEventType,
} from "@/features/feed/types/feed-event";
import type { FeedEventDTO } from "@/lib/types/feed";
import { computePaceMinPerKm } from "@/lib/validators/run";

const FEED_EVENT_TYPE_SET = new Set<string>(Object.values(FEED_EVENT_TYPES));

export type FeedEventRow = {
  id: string;
  challenge_id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  profiles: FeedActorSource | FeedActorSource[] | null;
};

type FeedActorSource = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type RunEnrichment = {
  id: string;
  distance_km: number;
  duration_min: number;
  notes: string | null;
  photo_count: number;
};

function mapActor(
  profiles: FeedActorSource | FeedActorSource[] | null,
): FeedActor | null {
  if (!profiles) {
    return null;
  }

  const profile = Array.isArray(profiles) ? profiles[0] : profiles;

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
}

function assertFeedEventType(eventType: string): FeedEventType {
  if (FEED_EVENT_TYPE_SET.has(eventType)) {
    return eventType as FeedEventType;
  }

  throw new Error(`Unknown feed event type: ${eventType}`);
}

function enrichRunPayload(
  eventType: FeedEventType,
  payload: Record<string, unknown>,
  run: RunEnrichment | undefined,
): Record<string, unknown> {
  if (!run) {
    return payload;
  }

  const distanceKm = Number(run.distance_km);
  const durationMin = run.duration_min;
  const paceMinPerKm = computePaceMinPerKm(distanceKm, durationMin);

  if (eventType === FEED_EVENT_TYPES.RUN_CREATED) {
    return {
      runId: run.id,
      distanceKm,
      durationMin,
      paceMinPerKm,
      notes: run.notes,
      photoCount: run.photo_count,
      ...payload,
    };
  }

  if (eventType === FEED_EVENT_TYPES.RUN_UPDATED) {
    return {
      runId: run.id,
      distanceKm,
      durationMin,
      ...payload,
    };
  }

  if (eventType === FEED_EVENT_TYPES.RUN_DELETED) {
    return {
      runId: run?.id ?? (payload.runId as string | undefined),
      distanceKm: run ? distanceKm : Number(payload.distance_km ?? payload.distanceKm ?? 0),
      durationMin: run ? durationMin : Number(payload.duration_min ?? payload.durationMin ?? 0),
      ...payload,
    };
  }

  return payload;
}

export function mapFeedEventRow(
  row: FeedEventRow,
  runEnrichment?: RunEnrichment,
): FeedEventDTO {
  const eventType = assertFeedEventType(row.event_type);
  const basePayload = (row.payload ?? {}) as Record<string, unknown>;

  const payload = enrichRunPayload(eventType, basePayload, runEnrichment);

  if (row.entity_type === "run" && row.entity_id && !payload.runId) {
    payload.runId = row.entity_id;
  }

  return {
    id: row.id,
    challengeId: row.challenge_id,
    eventType,
    payload,
    actor: mapActor(row.profiles),
    createdAt: row.created_at,
  };
}

export async function fetchRunEnrichments(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  runIds: string[],
): Promise<Map<string, RunEnrichment>> {
  if (!runIds.length) {
    return new Map();
  }

  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("id, distance_km, duration_min, notes")
    .in("id", runIds);

  if (runsError) {
    throw runsError;
  }

  const { data: photos, error: photosError } = await supabase
    .from("run_photos")
    .select("run_id")
    .in("run_id", runIds);

  if (photosError) {
    throw photosError;
  }

  const photoCounts = new Map<string, number>();
  for (const photo of photos ?? []) {
    photoCounts.set(photo.run_id, (photoCounts.get(photo.run_id) ?? 0) + 1);
  }

  const enrichments = new Map<string, RunEnrichment>();

  for (const run of runs ?? []) {
    enrichments.set(run.id, {
      id: run.id,
      distance_km: run.distance_km,
      duration_min: run.duration_min,
      notes: run.notes,
      photo_count: photoCounts.get(run.id) ?? 0,
    });
  }

  return enrichments;
}
