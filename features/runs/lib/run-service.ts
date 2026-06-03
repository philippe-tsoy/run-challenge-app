import type { SupabaseClient } from "@supabase/supabase-js";

import {
  toRunDTO,
  toRunPhotoDTO,
  type RunDetailDTO,
  type RunDTO,
  type RunPhotoDTO,
  type RunPhotoRow,
  type RunRow,
} from "@/lib/types/run";
import type { CreateRunInput, UpdateRunInput } from "@/lib/validators/run";
import { validateRunMetrics } from "@/lib/validators/run";
import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import { writeAuditLog } from "@/lib/admin/audit-log";

const RUN_SELECT =
  "id, challenge_id, user_id, distance_km, duration_min, notes, source, is_valid, created_at, profiles(id, username, email, display_name, avatar_url)";

export async function getRunById(
  supabase: SupabaseClient,
  runId: string,
): Promise<RunRow | null> {
  const { data, error } = await supabase
    .from("runs")
    .select(
      "id, challenge_id, user_id, distance_km, duration_min, notes, source, is_valid, created_at",
    )
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRunDetail(
  supabase: SupabaseClient,
  runId: string,
): Promise<RunDetailDTO | null> {
  const { data, error } = await supabase
    .from("runs")
    .select(RUN_SELECT)
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: photos, error: photosError } = await supabase
    .from("run_photos")
    .select("id, run_id, original_url, thumbnail_url, width, height")
    .eq("run_id", runId)
    .order("uploaded_at", { ascending: true });

  if (photosError) {
    throw photosError;
  }

  const { count: reactionCount, error: reactionsError } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("run_id", runId);

  if (reactionsError) {
    throw reactionsError;
  }

  const run = toRunDTO(data);

  const signedPhotos = await Promise.all(
    (photos ?? []).map((photo) => toRunPhotoDTOSigned(supabase, photo)),
  );

  const emptyReactions: import("@/lib/types/social").ReactionsSummary = {
    counts: { like: 0, fire: 0, water: 0, ice: 0 },
    userReaction: null,
  };

  return {
    ...run,
    challengeId: data.challenge_id,
    photos: signedPhotos,
    reactionCount: reactionCount ?? 0,
    comments: [],
    reactions: emptyReactions,
  };
}

export async function listRuns(
  supabase: SupabaseClient,
  options: {
    challengeId: string;
    userId?: string;
    cursor?: string;
    limit: number;
  },
): Promise<{ runs: RunDTO[]; nextCursor: string | null }> {
  let query = supabase
    .from("runs")
    .select(RUN_SELECT)
    .eq("challenge_id", options.challengeId)
    .order("created_at", { ascending: false })
    .limit(options.limit + 1);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  if (options.cursor) {
    query = query.lt("created_at", options.cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const nextCursor = hasMore ? page[page.length - 1]?.created_at ?? null : null;

  return {
    runs: page.map((row) => toRunDTO(row)),
    nextCursor,
  };
}

export async function getLatestRunForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<RunDTO | null> {
  const { data, error } = await supabase
    .from("runs")
    .select(RUN_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toRunDTO(data) : null;
}

async function recordIdempotentOperation(
  supabase: SupabaseClient,
  userId: string,
  clientOperationId: string,
  runId: string,
): Promise<void> {
  const { error } = await supabase.from("sync_operations").insert({
    client_operation_id: clientOperationId,
    user_id: userId,
    operation_type: `create_run:${runId}`,
  });

  if (error) {
    throw error;
  }
}

async function findIdempotentRun(
  supabase: SupabaseClient,
  userId: string,
  clientOperationId: string,
): Promise<RunDTO | null> {
  const { data, error } = await supabase
    .from("sync_operations")
    .select("operation_type")
    .eq("user_id", userId)
    .eq("client_operation_id", clientOperationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.operation_type?.startsWith("create_run:")) {
    return null;
  }

  const runId = data.operation_type.replace("create_run:", "");
  const detail = await getRunDetail(supabase, runId);
  return detail;
}

export async function createRun(
  supabase: SupabaseClient,
  userId: string,
  input: CreateRunInput,
  options?: { idempotencyKey?: string },
): Promise<RunDTO> {
  if (options?.idempotencyKey) {
    const existing = await findIdempotentRun(
      supabase,
      userId,
      options.idempotencyKey,
    );
    if (existing) {
      return existing;
    }
  }

  const isMember = await isChallengeMember(
    supabase,
    input.challengeId,
    userId,
  );
  if (!isMember) {
    throw Object.assign(new Error("NOT_CHALLENGE_MEMBER"), {
      code: "NOT_CHALLENGE_MEMBER",
    });
  }

  const metrics = validateRunMetrics(input);
  if (!metrics.ok) {
    throw Object.assign(new Error(metrics.message), {
      code: "PACE_OUT_OF_RANGE",
    });
  }

  const insertRow: Record<string, unknown> = {
    challenge_id: input.challengeId,
    user_id: userId,
    distance_km: input.distanceKm,
    duration_min: input.durationMin,
    notes: input.notes ?? null,
    source: input.source,
    is_valid: true,
  };

  if (input.ranAt) {
    insertRow.created_at = input.ranAt;
  }

  const { data, error } = await supabase
    .from("runs")
    .insert(insertRow)
    .select(RUN_SELECT)
    .single();

  if (error) {
    throw error;
  }

  const run = toRunDTO(data);

  if (options?.idempotencyKey) {
    await recordIdempotentOperation(
      supabase,
      userId,
      options.idempotencyKey,
      run.id,
    );
  }

  return run;
}

export async function updateRun(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
  input: UpdateRunInput,
  isAdmin: boolean,
): Promise<RunDTO> {
  if (isAdmin) {
    throw Object.assign(new Error("ADMIN_CANNOT_EDIT_RUN"), {
      code: "ADMIN_CANNOT_EDIT_RUN",
    });
  }

  const existing = await getRunById(supabase, runId);
  if (!existing) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  if (existing.user_id !== userId) {
    throw Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
  }

  const distanceKm = input.distanceKm ?? Number(existing.distance_km);
  const durationMin = input.durationMin ?? existing.duration_min;
  const adminOverride = input.adminOverride ?? false;

  const metrics = validateRunMetrics({
    distanceKm,
    durationMin,
    adminOverride,
  });

  if (!metrics.ok) {
    throw Object.assign(new Error(metrics.message), {
      code: "PACE_OUT_OF_RANGE",
    });
  }

  const updates: Record<string, unknown> = {};

  if (input.distanceKm !== undefined) updates.distance_km = input.distanceKm;
  if (input.durationMin !== undefined) updates.duration_min = input.durationMin;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.source !== undefined) updates.source = input.source;
  if (input.ranAt !== undefined) updates.created_at = input.ranAt;

  const { data, error } = await supabase
    .from("runs")
    .update(updates)
    .eq("id", runId)
    .select(RUN_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return toRunDTO(data);
}

export async function deleteRun(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const existing = await getRunById(supabase, runId);
  if (!existing) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  if (!isAdmin && existing.user_id !== userId) {
    throw Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
  }

  const { data: photos } = await supabase
    .from("run_photos")
    .select("original_url, thumbnail_url")
    .eq("run_id", runId);

  const { error } = await supabase.from("runs").delete().eq("id", runId);

  if (error) {
    throw error;
  }

  if (photos?.length) {
    const paths = photos.flatMap((photo) => {
      const originalPath = storagePathFromUrl(photo.original_url);
      const thumbPath = storagePathFromUrl(photo.thumbnail_url);
      return [originalPath, thumbPath].filter(Boolean) as string[];
    });

    if (paths.length) {
      await supabase.storage.from("run-photos").remove(paths);
    }
  }

  if (isAdmin) {
    await writeAuditLog({
      actorUserId: userId,
      action: "run_hard_delete",
      entityType: "run",
      entityId: runId,
      payload: { challenge_id: existing.challenge_id },
    });
  }
}

export async function invalidateRun(
  supabase: SupabaseClient,
  runId: string,
  reason: string,
  actorUserId: string,
): Promise<RunDTO> {
  const { data, error } = await supabase
    .from("runs")
    .update({ is_valid: false })
    .eq("id", runId)
    .select(RUN_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to invalidate run");
  }

  await writeAuditLog({
    actorUserId,
    action: "run_invalidate",
    entityType: "run",
    entityId: runId,
    payload: { reason },
  });

  return toRunDTO(data);
}

export async function restoreRun(
  supabase: SupabaseClient,
  runId: string,
  actorUserId: string,
): Promise<RunDTO> {
  const { data, error } = await supabase
    .from("runs")
    .update({ is_valid: true })
    .eq("id", runId)
    .select(RUN_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to restore run");
  }

  await writeAuditLog({
    actorUserId,
    action: "run_restore",
    entityType: "run",
    entityId: runId,
  });

  return toRunDTO(data);
}

function storagePathFromUrl(url: string): string | null {
  if (!url.startsWith("http")) {
    return url;
  }

  const marker = "/run-photos/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return url.slice(index + marker.length);
}

async function signStoragePath(
  supabase: SupabaseClient,
  path: string,
): Promise<string> {
  if (path.startsWith("http")) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from("run-photos")
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return path;
  }

  return data.signedUrl;
}

async function toRunPhotoDTOSigned(
  supabase: SupabaseClient,
  row: RunPhotoRow,
): Promise<RunPhotoDTO> {
  return {
    id: row.id,
    originalUrl: await signStoragePath(supabase, row.original_url),
    thumbnailUrl: await signStoragePath(supabase, row.thumbnail_url),
    width: row.width,
    height: row.height,
  };
}

export async function getPhotoCount(
  supabase: SupabaseClient,
  runId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("run_photos")
    .select("*", { count: "exact", head: true })
    .eq("run_id", runId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function insertRunPhotos(
  supabase: SupabaseClient,
  runId: string,
  photos: RunPhotoDTO[],
): Promise<RunPhotoDTO[]> {
  const rows = photos.map((photo) => ({
    id: photo.id,
    run_id: runId,
    original_url: photo.originalUrl,
    thumbnail_url: photo.thumbnailUrl,
    width: photo.width,
    height: photo.height,
  }));

  const { data, error } = await supabase
    .from("run_photos")
    .insert(rows)
    .select("id, run_id, original_url, thumbnail_url, width, height");

  if (error) {
    throw error;
  }

  return Promise.all((data ?? []).map((photo) => toRunPhotoDTOSigned(supabase, photo)));
}

export async function deleteRunPhoto(
  supabase: SupabaseClient,
  runId: string,
  photoId: string,
  userId: string,
): Promise<void> {
  const run = await getRunById(supabase, runId);
  if (!run) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  if (run.user_id !== userId) {
    throw Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
  }

  const { data: photo, error: photoError } = await supabase
    .from("run_photos")
    .select("original_url, thumbnail_url")
    .eq("id", photoId)
    .eq("run_id", runId)
    .maybeSingle();

  if (photoError) {
    throw photoError;
  }

  if (!photo) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  const { error } = await supabase
    .from("run_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    throw error;
  }

  const paths = [photo.original_url, photo.thumbnail_url]
    .map(storagePathFromUrl)
    .filter(Boolean) as string[];

  if (paths.length) {
    await supabase.storage.from("run-photos").remove(paths);
  }
}
