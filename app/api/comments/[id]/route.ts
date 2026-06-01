import { type NextRequest } from "next/server";

import { isUserAdmin, requireAuthenticatedUser } from "@/lib/auth/admin";
import { forbiddenError, notFoundError } from "@/lib/api/errors";
import { deleteComment } from "@/features/social/lib/social-service";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const isAdmin = await isUserAdmin(supabase, auth.user.id);

  try {
    await deleteComment(supabase, id, auth.user.id, isAdmin);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "FORBIDDEN") {
        return forbiddenError("You can only delete your own comments");
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Comment not found");
      }
    }

    throw error;
  }
}
