import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import {
  forbiddenError,
  notFoundError,
  validationError,
} from "@/lib/api/errors";
import {
  deleteReaction,
  upsertReaction,
} from "@/features/social/lib/social-service";
import { createClient } from "@/lib/supabase/server";
import { upsertReactionSchema } from "@/lib/validators/social";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id: runId } = await context.params;
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

  const parsed = upsertReactionSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const reaction = await upsertReaction(
      supabase,
      runId,
      auth.user.id,
      parsed.data.type,
    );
    return Response.json(reaction);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "FORBIDDEN") {
        return forbiddenError("You are not a member of this challenge");
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Run not found");
      }
    }

    throw error;
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: runId } = await context.params;
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    await deleteReaction(supabase, runId, auth.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "FORBIDDEN") {
        return forbiddenError("You are not a member of this challenge");
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Run not found");
      }
    }

    throw error;
  }
}
