import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { listBadgeCatalog } from "@/features/badges/lib/badge-service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const badges = await listBadgeCatalog(supabase, auth.user.id);
  return Response.json({ badges });
}
