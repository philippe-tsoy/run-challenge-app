import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { forbiddenError, notFoundError } from "@/lib/api/errors";
import { deleteRunPhoto } from "@/features/runs/lib/run-service";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; photoId: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id, photoId } = await context.params;
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    await deleteRunPhoto(supabase, id, photoId, auth.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "FORBIDDEN") {
        return forbiddenError("You can only delete photos from your own runs");
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Photo not found");
      }
    }

    throw error;
  }
}
