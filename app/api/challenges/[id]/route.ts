import { type NextRequest } from "next/server";

import {
  requireAdminUser,
  requireAuthenticatedUser,
} from "@/lib/auth/admin";
import {
  conflictError,
  forbiddenError,
  notFoundError,
  validationError,
} from "@/lib/api/errors";
import {
  getChallengeDetail,
  isChallengeMember,
  updateChallenge,
} from "@/features/challenges/lib/challenge-service";
import { createClient } from "@/lib/supabase/server";
import { updateChallengeSchema } from "@/lib/validators/challenge";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const isMember = await isChallengeMember(supabase, id, auth.user.id);
  if (!isMember) {
    return forbiddenError("You are not a member of this challenge");
  }

  const challenge = await getChallengeDetail(supabase, id);
  if (!challenge) {
    return notFoundError("Challenge not found");
  }

  return Response.json(challenge);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = updateChallengeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const existing = await getChallengeDetail(supabase, id);
  if (!existing) {
    return notFoundError("Challenge not found");
  }

  try {
    const challenge = await updateChallenge(supabase, id, parsed.data);
    return Response.json(challenge);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "ACTIVE_CHALLENGE_EXISTS"
    ) {
      return conflictError(
        "Another challenge is already active. Deactivate it first.",
      );
    }

    throw error;
  }
}
