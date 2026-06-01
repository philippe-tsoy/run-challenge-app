import { type NextRequest } from "next/server";

import { performSignup } from "@/lib/auth/signup";
import {
  businessRuleError,
  conflictError,
  validationError,
} from "@/lib/api/errors";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  createRouteHandlerClient,
  jsonWithCookies,
} from "@/lib/supabase/route-handler";
import { signupSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const admin = createServiceRoleClient();
  const result = await performSignup(admin, parsed.data);

  if (!result.ok) {
    if (result.status === 409) {
      return conflictError(result.message);
    }
    return businessRuleError(result.message);
  }

  const { supabase, getResponse } = createRouteHandlerClient(request);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });

  if (signInError) {
    return validationError("Account created but sign-in failed. Try logging in.");
  }

  return jsonWithCookies({ user: result.user }, getResponse(), { status: 201 });
}
