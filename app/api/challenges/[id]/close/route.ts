import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import { notFoundError } from "@/lib/api/errors";
import { closeChallengeEarly } from "@/features/challenges/lib/challenge-service";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const challenge = await closeChallengeEarly(supabase, id, auth.user.id);
    return Response.json(challenge);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "NOT_FOUND"
    ) {
      return notFoundError("Challenge not found");
    }

    throw error;
  }
}
