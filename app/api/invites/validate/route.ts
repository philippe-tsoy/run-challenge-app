import { validateInviteCode } from "@/lib/auth/invite";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { inviteValidateSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = inviteValidateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const admin = createServiceRoleClient();
  const result = await validateInviteCode(admin, parsed.data.code);

  if (!result.valid) {
    return businessRuleError(result.reason);
  }

  return Response.json({
    valid: true,
    description: result.description,
  });
}
