import type { SupabaseClient } from "@supabase/supabase-js";

export type InviteCodeRow = {
  id: string;
  code: string;
  description: string | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
};

export type InviteValidationResult =
  | { valid: true; invite: InviteCodeRow; description?: string }
  | { valid: false; reason: string };

export async function validateInviteCode(
  admin: SupabaseClient,
  code: string,
): Promise<InviteValidationResult> {
  const normalizedCode = code.trim();

  const { data: invite, error } = await admin
    .from("invite_codes")
    .select(
      "id, code, description, is_active, max_uses, current_uses, expires_at",
    )
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!invite) {
    return { valid: false, reason: "Invalid invite code" };
  }

  if (!invite.is_active) {
    return { valid: false, reason: "This invite code is no longer active" };
  }

  if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
    return { valid: false, reason: "This invite code has expired" };
  }

  if (
    invite.max_uses !== null &&
    invite.current_uses >= invite.max_uses
  ) {
    return { valid: false, reason: "This invite code has reached its use limit" };
  }

  return {
    valid: true,
    invite,
    description: invite.description ?? undefined,
  };
}

export async function incrementInviteUse(
  admin: SupabaseClient,
  inviteId: string,
  currentUses: number,
): Promise<void> {
  const { error } = await admin
    .from("invite_codes")
    .update({ current_uses: currentUses + 1 })
    .eq("id", inviteId);

  if (error) {
    throw error;
  }
}
