import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import { notFoundError, validationError } from "@/lib/api/errors";
import { updateInviteCode } from "@/features/admin/lib/admin-invites-service";
import { createClient } from "@/lib/supabase/server";
import { updateInviteSchema } from "@/lib/validators/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = updateInviteSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const invite = await updateInviteCode(
      supabase,
      id,
      parsed.data,
      auth.user.id,
    );
    return Response.json(invite);
  } catch {
    return notFoundError("Invite code not found");
  }
}
