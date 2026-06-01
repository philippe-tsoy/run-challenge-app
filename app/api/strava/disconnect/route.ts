import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { disconnectStrava } from "@/features/strava/lib/strava-account-service";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  await disconnectStrava(supabase, auth.user.id);
  return new Response(null, { status: 204 });
}
