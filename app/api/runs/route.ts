import { type NextRequest } from "next/server";

import {
  requireAuthenticatedUser,
  isUserAdmin,
} from "@/lib/auth/admin";
import {
  businessRuleError,
  forbiddenError,
  validationError,
} from "@/lib/api/errors";
import { createRun, listRuns } from "@/features/runs/lib/run-service";
import { createClient } from "@/lib/supabase/server";
import {
  createRunSchema,
  listRunsQuerySchema,
} from "@/lib/validators/run";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listRunsQuerySchema.safeParse(params);

  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await listRuns(supabase, parsed.data);

  return Response.json(result);
}

export async function POST(request: NextRequest) {
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

  const parsed = createRunSchema.safeParse(body);
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

  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  try {
    const run = await createRun(supabase, auth.user.id, parsed.data, {
      idempotencyKey,
    });

    return Response.json(run, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("PACE")) {
        return businessRuleError(error.message);
      }
      if ((error as Error & { code?: string }).code === "NOT_CHALLENGE_MEMBER") {
        return forbiddenError("You are not a member of this challenge");
      }
    }

    throw error;
  }
}
