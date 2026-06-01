import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import {
  forbiddenError,
  notFoundError,
  validationError,
} from "@/lib/api/errors";
import { createComment } from "@/features/social/lib/social-service";
import { createClient } from "@/lib/supabase/server";
import { createCommentSchema } from "@/lib/validators/social";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
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

  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const comment = await createComment(
      supabase,
      runId,
      auth.user.id,
      parsed.data,
    );
    return Response.json(comment, { status: 201 });
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
