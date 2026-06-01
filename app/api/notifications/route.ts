import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { validationError } from "@/lib/api/errors";
import { listNotifications } from "@/features/social/lib/social-service";
import { createClient } from "@/lib/supabase/server";
import { listNotificationsQuerySchema } from "@/lib/validators/social";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listNotificationsQuerySchema.safeParse(params);

  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await listNotifications(supabase, auth.user.id, parsed.data);

  return Response.json({
    notifications: result.notifications,
    unreadCount: result.unreadCount,
    nextCursor: result.nextCursor,
  });
}
