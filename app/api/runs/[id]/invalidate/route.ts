import { type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth/admin";
import { notFoundError, validationError } from "@/lib/api/errors";
import { invalidateRun } from "@/features/runs/lib/run-service";
import { createClient } from "@/lib/supabase/server";

const invalidateSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required"),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
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

  const parsed = invalidateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const run = await invalidateRun(
      supabase,
      id,
      parsed.data.reason,
      auth.user.id,
    );
    return Response.json(run);
  } catch {
    return notFoundError("Run not found");
  }
}
