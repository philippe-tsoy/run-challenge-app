import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { forbiddenError, validationError } from "@/lib/api/errors";
import { getLeaderboard } from "@/features/leaderboards/lib/leaderboard-service";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboardQuerySchema } from "@/lib/validators/leaderboard";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = getLeaderboardQuerySchema.safeParse(params);

  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const leaderboard = await getLeaderboard(
      supabase,
      auth.user.id,
      parsed.data.challengeId,
      parsed.data.mode,
    );

    return Response.json(leaderboard);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "NOT_CHALLENGE_MEMBER"
    ) {
      return forbiddenError("You are not a member of this challenge");
    }

    throw error;
  }
}
