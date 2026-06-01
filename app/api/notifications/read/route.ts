import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { validationError } from "@/lib/api/errors";
import { markNotificationsRead } from "@/features/social/lib/social-service";
import { createClient } from "@/lib/supabase/server";
import { markNotificationsReadSchema } from "@/lib/validators/social";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = markNotificationsReadSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  await markNotificationsRead(supabase, auth.user.id, parsed.data);

  return new Response(null, { status: 204 });
}
