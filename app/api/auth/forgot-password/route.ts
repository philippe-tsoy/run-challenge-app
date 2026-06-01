import { type NextRequest } from "next/server";

import { getSiteUrl } from "@/lib/auth/site-url";
import { validationError } from "@/lib/api/errors";
import {
  createRouteHandlerClient,
  jsonWithCookies,
} from "@/lib/supabase/route-handler";
import { forgotPasswordSchema } from "@/lib/validators/auth";

const RESET_SENT_MESSAGE =
  "If an account exists for that email, you will receive a password reset link shortly.";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { supabase, getResponse } = createRouteHandlerClient(request);
  const redirectTo = `${getSiteUrl(request)}/auth/callback?next=${encodeURIComponent("/reset-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email.toLowerCase(),
    { redirectTo },
  );

  if (error) {
    return validationError(
      error.message || "Unable to send reset email. Try again later.",
    );
  }

  return jsonWithCookies({ message: RESET_SENT_MESSAGE }, getResponse());
}
