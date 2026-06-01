import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { forbiddenError, validationError } from "@/lib/api/errors";
import { getJourney } from "@/features/journey/lib/journey-service";
import { createClient } from "@/lib/supabase/server";
import { getJourneyQuerySchema } from "@/lib/validators/journey";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = getJourneyQuerySchema.safeParse(params);

  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const journey = await getJourney(
      supabase,
      auth.user.id,
      parsed.data.challengeId,
    );

    return Response.json(journey);
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
