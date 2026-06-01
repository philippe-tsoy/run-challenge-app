import { type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/admin";
import {
  businessRuleError,
  notFoundError,
  validationError,
} from "@/lib/api/errors";
import { removeUserFromChallenge } from "@/features/admin/lib/admin-users-service";
import { createClient } from "@/lib/supabase/server";
import { removeUserFromChallengeSchema } from "@/lib/validators/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: userId } = await context.params;
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  if (userId === auth.user.id) {
    return businessRuleError("You cannot remove yourself");
  }

  const challengeId = request.nextUrl.searchParams.get("challengeId");
  const parsed = removeUserFromChallengeSchema.safeParse({ challengeId });

  if (!parsed.success) {
    return validationError("challengeId query parameter is required", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { count, error: memberError } = await supabase
    .from("challenge_members")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", parsed.data.challengeId)
    .eq("user_id", userId);

  if (memberError) {
    throw memberError;
  }

  if (!count) {
    return notFoundError("User is not a member of this challenge");
  }

  await removeUserFromChallenge(
    supabase,
    userId,
    parsed.data.challengeId,
    auth.user.id,
  );

  return new Response(null, { status: 204 });
}
