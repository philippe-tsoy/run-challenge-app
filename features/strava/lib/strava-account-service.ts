import type { SupabaseClient } from "@supabase/supabase-js";

import {
  refreshStravaToken,
  type StravaTokenResponse,
} from "@/features/strava/lib/strava-api";
import type { StravaConnectionDTO } from "@/lib/types/strava";

type StravaAccountRow = {
  user_id: string;
  athlete_id: number;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
};

function mapConnection(row: StravaAccountRow | null): StravaConnectionDTO {
  if (!row) {
    return {
      connected: false,
      athleteId: null,
      tokenExpiresAt: null,
    };
  }

  return {
    connected: true,
    athleteId: Number(row.athlete_id),
    tokenExpiresAt: row.token_expires_at,
  };
}

export async function getStravaConnection(
  supabase: SupabaseClient,
  userId: string,
): Promise<StravaConnectionDTO> {
  const { data, error } = await supabase
    .from("strava_accounts")
    .select("user_id, athlete_id, access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapConnection(data as StravaAccountRow | null);
}

export async function saveStravaTokens(
  supabase: SupabaseClient,
  userId: string,
  token: StravaTokenResponse,
): Promise<StravaConnectionDTO> {
  const row: Record<string, unknown> = {
    user_id: userId,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_expires_at: new Date(token.expires_at * 1000).toISOString(),
  };

  if (token.athlete?.id != null) {
    row.athlete_id = token.athlete.id;
  }

  const { data, error } = await supabase
    .from("strava_accounts")
    .upsert(row, { onConflict: "user_id" })
    .select("user_id, athlete_id, access_token, refresh_token, token_expires_at")
    .single();

  if (error) {
    throw error;
  }

  return mapConnection(data as StravaAccountRow);
}

export async function disconnectStrava(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("strava_accounts")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function getValidStravaAccessToken(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("strava_accounts")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw Object.assign(new Error("STRAVA_NOT_CONNECTED"), {
      code: "STRAVA_NOT_CONNECTED",
    });
  }

  const expiresAt = new Date(data.token_expires_at).getTime();
  const refreshBufferMs = 5 * 60 * 1000;

  if (Date.now() < expiresAt - refreshBufferMs) {
    return data.access_token;
  }

  const refreshed = await refreshStravaToken(data.refresh_token);
  await saveStravaTokens(supabase, userId, refreshed);
  return refreshed.access_token;
}
