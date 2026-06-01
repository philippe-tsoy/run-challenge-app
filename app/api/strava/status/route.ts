import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { getStravaConnection } from "@/features/strava/lib/strava-account-service";
import { isStravaConfigured } from "@/features/strava/lib/strava-config";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  if (!isStravaConfigured()) {
    return Response.json({
      configured: false,
      connected: false,
      athleteId: null,
      tokenExpiresAt: null,
    });
  }

  const connection = await getStravaConnection(supabase, auth.user.id);

  return Response.json({
    configured: true,
    ...connection,
  });
}
