import type { SupabaseClient } from "@supabase/supabase-js";

import {
  incrementInviteUse,
  validateInviteCode,
} from "@/lib/auth/invite";
import type { ProfileDTO } from "@/lib/types/profile";
import { toProfileDTO } from "@/lib/types/profile";
import type { SignupInput } from "@/lib/validators/auth";

export type SignupResult =
  | { ok: true; user: ProfileDTO }
  | { ok: false; status: 409 | 422; message: string };

export async function performSignup(
  admin: SupabaseClient,
  input: SignupInput,
): Promise<SignupResult> {
  const inviteResult = await validateInviteCode(admin, input.inviteCode);
  if (!inviteResult.valid) {
    return { ok: false, status: 422, message: inviteResult.reason };
  }

  const normalizedUsername = input.username.toLowerCase();
  const normalizedEmail = input.email.toLowerCase();

  const { data: existingUsername } = await admin
    .from("profiles")
    .select("id")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (existingUsername) {
    return { ok: false, status: 409, message: "Username is already taken" };
  }

  const { data: existingEmail } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingEmail) {
    return { ok: false, status: 409, message: "Email is already registered" };
  }

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: input.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes("already")) {
      return {
        ok: false,
        status: 409,
        message: "Email is already registered",
      };
    }
    throw authError ?? new Error("Failed to create auth user");
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: userId,
      username: normalizedUsername,
      email: normalizedEmail,
    })
    .select("id, username, email, display_name, avatar_url")
    .single();

  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(userId);
    if (profileError?.code === "23505") {
      return { ok: false, status: 409, message: "Username is already taken" };
    }
    throw profileError ?? new Error("Failed to create profile");
  }

  try {
    await incrementInviteUse(
      admin,
      inviteResult.invite.id,
      inviteResult.invite.current_uses,
    );

    const { data: activeChallenge } = await admin
      .from("challenges")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    if (activeChallenge) {
      const { error: memberError } = await admin
        .from("challenge_members")
        .insert({
          challenge_id: activeChallenge.id,
          user_id: userId,
        });

      if (memberError) {
        throw memberError;
      }
    }
  } catch (error) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    throw error;
  }

  return { ok: true, user: toProfileDTO(profile) };
}
