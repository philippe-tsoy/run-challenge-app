import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProfileDTO } from "@/lib/types/profile";
import { toProfileDTO } from "@/lib/types/profile";

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileDTO | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, email, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toProfileDTO(data) : null;
}

export async function getSessionProfile(
  supabase: SupabaseClient,
): Promise<ProfileDTO | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return getProfileForUser(supabase, user.id);
}
