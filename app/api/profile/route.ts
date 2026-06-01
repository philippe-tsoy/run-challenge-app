import { getSessionProfile } from "@/lib/auth/profile";
import {
  unauthorizedError,
  validationError,
} from "@/lib/api/errors";
import { toProfileDTO } from "@/lib/types/profile";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validators/auth";

export async function GET() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);

  if (!profile) {
    return unauthorizedError();
  }

  return Response.json(profile);
}

export async function PATCH(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorizedError();
  }

  const updates: Record<string, string | null> = {};

  if (parsed.data.displayName !== undefined) {
    updates.display_name = parsed.data.displayName;
  }

  if (parsed.data.avatarUrl !== undefined) {
    updates.avatar_url = parsed.data.avatarUrl;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id, username, email, display_name, avatar_url")
    .single();

  if (error || !data) {
    return validationError("Failed to update profile");
  }

  return Response.json(toProfileDTO(data));
}
