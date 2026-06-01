import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import { conflictError, validationError } from "@/lib/api/errors";
import {
  createInviteCode,
  listInviteCodes,
} from "@/features/admin/lib/admin-invites-service";
import { createClient } from "@/lib/supabase/server";
import { createInviteSchema } from "@/lib/validators/admin";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const invites = await listInviteCodes(supabase);
  return Response.json({ invites });
}

export async function POST(request: NextRequest) {
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

  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const invite = await createInviteCode(
      supabase,
      parsed.data,
      auth.user.id,
    );
    return Response.json(invite, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return conflictError("An invite code with that value already exists");
    }

    throw error;
  }
}
