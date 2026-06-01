import { type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth/admin";
import { validationError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return validationError("Invalid query", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, action, entity_type, entity_id, payload, created_at, profiles:actor_user_id(id, username, display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (error) {
    throw error;
  }

  const entries = (data ?? []).map((row) => {
    const actor = row.profiles as
      | { id: string; username: string; display_name: string | null }
      | { id: string; username: string; display_name: string | null }[]
      | null;
    const profile = Array.isArray(actor) ? actor[0] : actor;

    return {
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload as Record<string, unknown> | null,
      createdAt: row.created_at,
      actor: profile
        ? {
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
          }
        : null,
    };
  });

  return Response.json({ entries });
}
