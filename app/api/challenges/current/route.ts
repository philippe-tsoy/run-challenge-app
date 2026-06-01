import { requireAuthenticatedUser } from "@/lib/auth/admin";
import {
  getCurrentChallengeForUser,
} from "@/features/challenges/lib/challenge-service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const challenge = await getCurrentChallengeForUser(supabase, auth.user.id);

  return Response.json(challenge);
}
