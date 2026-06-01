import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { listUserBadges } from "@/features/badges/lib/badge-service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const badges = await listUserBadges(supabase, auth.user.id);
  return Response.json({ badges });
}
