import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import { notFoundError, validationError } from "@/lib/api/errors";
import { forceMilestone } from "@/features/milestones/lib/milestone-service";
import { createClient } from "@/lib/supabase/server";
import { forceMilestoneSchema } from "@/lib/validators/milestone";

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

  const parsed = forceMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const milestone = await forceMilestone(
      supabase,
      auth.user.id,
      parsed.data.challengeId,
      parsed.data.journeyNodeId,
    );

    return Response.json(milestone, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "NOT_FOUND"
    ) {
      return notFoundError("Journey node not found for this challenge");
    }

    throw error;
  }
}
