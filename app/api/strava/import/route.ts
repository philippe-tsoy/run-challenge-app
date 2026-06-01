import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import {
  apiError,
  forbiddenError,
  validationError,
} from "@/lib/api/errors";
import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import { importStravaActivities } from "@/features/strava/lib/strava-import-service";
import { isStravaConfigured } from "@/features/strava/lib/strava-config";
import { createClient } from "@/lib/supabase/server";
import { stravaImportSchema } from "@/lib/validators/strava";

export async function POST(request: NextRequest) {
  if (!isStravaConfigured()) {
    return apiError({
      code: "BUSINESS_RULE_VIOLATION",
      message: "Strava integration is not configured on this server",
      status: 503,
    });
  }

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

  const parsed = stravaImportSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const isMember = await isChallengeMember(
    supabase,
    parsed.data.challengeId,
    auth.user.id,
  );

  if (!isMember) {
    return forbiddenError("You are not a member of this challenge");
  }

  try {
    const result = await importStravaActivities(
      supabase,
      auth.user.id,
      parsed.data,
    );

    return Response.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "STRAVA_NOT_CONNECTED"
    ) {
      return apiError({
        code: "BUSINESS_RULE_VIOLATION",
        message: "Connect your Strava account before importing",
        status: 422,
      });
    }

    throw error;
  }
}
