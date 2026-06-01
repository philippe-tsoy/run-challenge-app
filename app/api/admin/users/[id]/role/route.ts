import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { setUserAdminRole } from "@/features/admin/lib/admin-users-service";
import { createClient } from "@/lib/supabase/server";
import { adminUserRoleSchema } from "@/lib/validators/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: targetUserId } = await context.params;
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

  const parsed = adminUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  if (
    targetUserId === auth.user.id &&
    parsed.data.action === "revoke"
  ) {
    return businessRuleError("You cannot revoke your own admin role");
  }

  await setUserAdminRole(
    supabase,
    targetUserId,
    parsed.data.action,
    auth.user.id,
  );

  return new Response(null, { status: 204 });
}
