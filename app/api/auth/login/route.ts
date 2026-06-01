import { type NextRequest } from "next/server";

import { getProfileForUser } from "@/lib/auth/profile";
import { validationError } from "@/lib/api/errors";
import {
  createRouteHandlerClient,
  jsonWithCookies,
} from "@/lib/supabase/route-handler";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid JSON body");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Validation failed", {
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { supabase, getResponse } = createRouteHandlerClient(request);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return validationError("Invalid email or password");
  }

  const profile = await getProfileForUser(supabase, data.user.id);
  if (!profile) {
    return validationError("Profile not found for this account");
  }

  return jsonWithCookies({ user: profile }, getResponse());
}
