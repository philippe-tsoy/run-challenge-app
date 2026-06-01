import { type NextRequest } from "next/server";

import {
  isUserAdmin,
  requireAuthenticatedUser,
} from "@/lib/auth/admin";
import {
  businessRuleError,
  forbiddenError,
  notFoundError,
  validationError,
} from "@/lib/api/errors";
import {
  getReactionsSummary,
  listCommentsForRun,
} from "@/features/social/lib/social-service";
import {
  deleteRun,
  getRunDetail,
  updateRun,
} from "@/features/runs/lib/run-service";
import { createClient } from "@/lib/supabase/server";
import { updateRunSchema } from "@/lib/validators/run";

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

  const run = await getRunDetail(supabase, id);
  if (!run) {
    return notFoundError("Run not found");
  }

  const [comments, reactions] = await Promise.all([
    listCommentsForRun(supabase, id),
    getReactionsSummary(supabase, id, auth.user.id),
  ]);

  return Response.json({ ...run, comments, reactions });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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

  const parsed = updateRunSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  if (parsed.data.adminOverride) {
    const isAdmin = await isUserAdmin(supabase, auth.user.id);
    if (!isAdmin) {
      return forbiddenError("Admin override is not allowed for this account");
    }
  }

  const isAdmin = await isUserAdmin(supabase, auth.user.id);

  try {
    const run = await updateRun(supabase, id, auth.user.id, parsed.data, isAdmin);
    return Response.json(run);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "FORBIDDEN" || code === "ADMIN_CANNOT_EDIT_RUN") {
        return forbiddenError(
          code === "ADMIN_CANNOT_EDIT_RUN"
            ? "Admins cannot edit run content"
            : "You can only edit your own runs",
        );
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Run not found");
      }
      if (error.message.includes("Pace")) {
        return businessRuleError(error.message);
      }
    }

    throw error;
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const isAdmin = await isUserAdmin(supabase, auth.user.id);

  try {
    await deleteRun(supabase, id, auth.user.id, isAdmin);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "FORBIDDEN") {
        return forbiddenError("You can only delete your own runs");
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Run not found");
      }
    }

    throw error;
  }
}
