import type { SupabaseClient } from "@supabase/supabase-js";

import { writeAuditLog } from "@/lib/admin/audit-log";

export type AdminUserDTO = {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  createdAt: string;
  isAdmin: boolean;
};

export async function listAdminUsers(
  supabase: SupabaseClient,
): Promise<AdminUserDTO[]> {
  const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, email, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, roles!inner(code)"),
    ]);

  if (profilesError) {
    throw profilesError;
  }

  if (rolesError) {
    throw rolesError;
  }

  const adminIds = new Set<string>();
  for (const row of roles ?? []) {
    const roleData = row.roles as { code: string } | { code: string }[] | null;
    const codes = Array.isArray(roleData)
      ? roleData.map((role) => role.code)
      : roleData
        ? [roleData.code]
        : [];
    if (codes.includes("admin")) {
      adminIds.add(row.user_id);
    }
  }

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    email: profile.email,
    createdAt: profile.created_at,
    isAdmin: adminIds.has(profile.id),
  }));
}

export async function setUserAdminRole(
  supabase: SupabaseClient,
  targetUserId: string,
  action: "grant" | "revoke",
  actorUserId: string,
): Promise<void> {
  const { data: adminRole, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("code", "admin")
    .single();

  if (roleError || !adminRole) {
    throw roleError ?? new Error("Admin role not found");
  }

  if (action === "grant") {
    const { error } = await supabase.from("user_roles").upsert({
      user_id: targetUserId,
      role_id: adminRole.id,
    });

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .eq("role_id", adminRole.id);

    if (error) {
      throw error;
    }
  }

  await writeAuditLog({
    actorUserId,
    action: action === "grant" ? "user_grant_admin" : "user_revoke_admin",
    entityType: "user",
    entityId: targetUserId,
  });
}

export async function removeUserFromChallenge(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string,
  actorUserId: string,
): Promise<void> {
  const { error } = await supabase
    .from("challenge_members")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  await writeAuditLog({
    actorUserId,
    action: "challenge_member_remove",
    entityType: "user",
    entityId: userId,
    payload: { challenge_id: challengeId },
  });
}
