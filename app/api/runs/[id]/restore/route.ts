import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import { notFoundError } from "@/lib/api/errors";
import { restoreRun } from "@/features/runs/lib/run-service";
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
    const run = await restoreRun(supabase, id, auth.user.id);
    return Response.json(run);
  } catch {
    return notFoundError("Run not found");
  }
}
