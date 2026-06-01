import type { SupabaseClient } from "@supabase/supabase-js";

import { createRun } from "@/features/runs/lib/run-service";
import { STRAVA_ALLOWED_ACTIVITY_TYPES } from "@/features/strava/lib/strava-config";
import { fetchStravaActivities } from "@/features/strava/lib/strava-api";
import { getValidStravaAccessToken } from "@/features/strava/lib/strava-account-service";
import { validateRunMetrics } from "@/lib/validators/run";
import type { StravaImportResultDTO } from "@/lib/types/strava";
import type { StravaImportInput } from "@/lib/validators/strava";

async function isDuplicateRun(
  supabase: SupabaseClient,
  userId: string,
  distanceKm: number,
  ranAt: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("potential_duplicate_run", {
    p_user_id: userId,
    p_distance: distanceKm,
    p_run_time: ranAt,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function isAlreadyImported(
  supabase: SupabaseClient,
  userId: string,
  activityId: number,
): Promise<boolean> {
  const clientOperationId = `strava:${activityId}`;
  const { data, error } = await supabase
    .from("sync_operations")
    .select("client_operation_id")
    .eq("user_id", userId)
    .eq("client_operation_id", clientOperationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function importStravaActivities(
  supabase: SupabaseClient,
  userId: string,
  input: StravaImportInput,
): Promise<StravaImportResultDTO> {
  const accessToken = await getValidStravaAccessToken(supabase, userId);

  const sinceEpoch = input.since
    ? Math.floor(new Date(input.since).getTime() / 1000)
    : Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;

  const result: StravaImportResultDTO = {
    imported: 0,
    skippedDuplicates: 0,
    skippedNonRun: 0,
    skippedInvalid: 0,
    skippedAlreadyImported: 0,
  };

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const activities = await fetchStravaActivities(accessToken, {
      afterEpoch: sinceEpoch,
      page,
    });

    if (!activities.length) {
      break;
    }

    for (const activity of activities) {
      if (!STRAVA_ALLOWED_ACTIVITY_TYPES.has(activity.type)) {
        result.skippedNonRun += 1;
        continue;
      }

      const idempotencyKey = `strava:${activity.id}`;

      if (await isAlreadyImported(supabase, userId, activity.id)) {
        result.skippedAlreadyImported += 1;
        continue;
      }

      const distanceKm =
        Math.round((activity.distance / 1000) * 100) / 100;
      const durationMin = Math.max(
        1,
        Math.round(activity.moving_time / 60),
      );
      const ranAt = new Date(activity.start_date).toISOString();

      const metrics = validateRunMetrics({
        distanceKm,
        durationMin,
        adminOverride: false,
      });

      if (!metrics.ok) {
        result.skippedInvalid += 1;
        continue;
      }

      if (await isDuplicateRun(supabase, userId, distanceKm, ranAt)) {
        result.skippedDuplicates += 1;
        continue;
      }

      await createRun(
        supabase,
        userId,
        {
          challengeId: input.challengeId,
          distanceKm,
          durationMin,
          notes: activity.name?.trim() || "Imported from Strava",
          source: "strava",
          adminOverride: false,
          ranAt,
        },
        { idempotencyKey },
      );

      result.imported += 1;
    }

    hasMore = activities.length === 50;
    page += 1;
  }

  return result;
}
