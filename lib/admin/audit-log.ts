import { createServiceRoleClient } from "@/lib/supabase/server";

export async function writeAuditLog(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const admin = createServiceRoleClient();
  const { error } = await admin.from("audit_log").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    payload: input.payload ?? null,
  });

  if (error) {
    throw error;
  }
}
