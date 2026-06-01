import type { SupabaseClient } from "@supabase/supabase-js";

import { writeAuditLog } from "@/lib/admin/audit-log";
import type {
  CreateInviteInput,
  UpdateInviteInput,
} from "@/lib/validators/admin";

export type InviteCodeDTO = {
  id: string;
  code: string;
  description: string | null;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  createdAt: string;
};

function toInviteDTO(row: {
  id: string;
  code: string;
  description: string | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
}): InviteCodeDTO {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    isActive: row.is_active,
    maxUses: row.max_uses,
    currentUses: row.current_uses,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function listInviteCodes(
  supabase: SupabaseClient,
): Promise<InviteCodeDTO[]> {
  const { data, error } = await supabase
    .from("invite_codes")
    .select(
      "id, code, description, is_active, max_uses, current_uses, expires_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toInviteDTO);
}

export async function createInviteCode(
  supabase: SupabaseClient,
  input: CreateInviteInput,
  createdBy: string,
): Promise<InviteCodeDTO> {
  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code: input.code,
      description: input.description ?? null,
      max_uses: input.maxUses ?? null,
      expires_at: input.expiresAt ?? null,
      created_by: createdBy,
    })
    .select(
      "id, code, description, is_active, max_uses, current_uses, expires_at, created_at",
    )
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create invite code");
  }

  await writeAuditLog({
    actorUserId: createdBy,
    action: "invite_create",
    entityType: "invite_code",
    entityId: data.id,
    payload: { code: data.code },
  });

  return toInviteDTO(data);
}

export async function updateInviteCode(
  supabase: SupabaseClient,
  inviteId: string,
  input: UpdateInviteInput,
  actorUserId: string,
): Promise<InviteCodeDTO> {
  const updates: Record<string, unknown> = {};
  if (input.isActive !== undefined) updates.is_active = input.isActive;
  if (input.description !== undefined) updates.description = input.description;
  if (input.maxUses !== undefined) updates.max_uses = input.maxUses;
  if (input.expiresAt !== undefined) updates.expires_at = input.expiresAt;

  const { data, error } = await supabase
    .from("invite_codes")
    .update(updates)
    .eq("id", inviteId)
    .select(
      "id, code, description, is_active, max_uses, current_uses, expires_at, created_at",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to update invite code");
  }

  await writeAuditLog({
    actorUserId,
    action: "invite_update",
    entityType: "invite_code",
    entityId: inviteId,
    payload: updates,
  });

  return toInviteDTO(data);
}
