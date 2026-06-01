import { type NextRequest } from "next/server";

import {
  requireAdminUser,
  requireAuthenticatedUser,
} from "@/lib/auth/admin";
import {
  conflictError,
  validationError,
} from "@/lib/api/errors";
import {
  createChallenge,
  listChallengesForUser,
} from "@/features/challenges/lib/challenge-service";
import { createClient } from "@/lib/supabase/server";
import {
  challengeStatusSchema,
  createChallengeSchema,
} from "@/lib/validators/challenge";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const statusParam = request.nextUrl.searchParams.get("status") ?? "all";
  const parsedStatus = challengeStatusSchema.safeParse(statusParam);

  if (!parsedStatus.success) {
    return validationError("Invalid status filter", {
      status: statusParam,
    });
  }

  const challenges = await listChallengesForUser(
    supabase,
    auth.user.id,
    parsedStatus.data,
  );

  return Response.json({ challenges });
}

export async function POST(request: NextRequest) {
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

  const parsed = createChallengeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const challenge = await createChallenge(
      supabase,
      parsed.data,
      auth.user.id,
    );

    return Response.json(challenge, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "ACTIVE_CHALLENGE_EXISTS"
    ) {
      return conflictError(
        "Another challenge is already active. Deactivate it first.",
      );
    }

    if (error instanceof Error && error.message.startsWith("Unknown theme")) {
      return validationError(error.message);
    }

    throw error;
  }
}
