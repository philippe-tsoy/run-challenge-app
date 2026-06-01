import { type NextRequest } from "next/server";

import { unauthorizedError, validationError } from "@/lib/api/errors";
import {
  createRouteHandlerClient,
  jsonWithCookies,
} from "@/lib/supabase/route-handler";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { supabase, getResponse } = createRouteHandlerClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorizedError(
      "Reset link expired or invalid. Request a new password reset email.",
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (updateError) {
    return validationError(
      updateError.message || "Unable to update password. Try again.",
    );
  }

  await supabase.auth.signOut();

  return jsonWithCookies(
    { message: "Password updated. Sign in with your new password." },
    getResponse(),
  );
}
