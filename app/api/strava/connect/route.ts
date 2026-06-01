import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import { getSiteUrl } from "@/lib/auth/site-url";
import { apiError } from "@/lib/api/errors";
import { buildStravaAuthorizeUrl } from "@/features/strava/lib/strava-api";
import { isStravaConfigured } from "@/features/strava/lib/strava-config";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "strava_oauth_state";

export async function GET(request: NextRequest) {
  if (!isStravaConfigured()) {
    return apiError({
      code: "BUSINESS_RULE_VIOLATION",
      message: "Strava integration is not configured on this server",
      status: 503,
    });
  }

  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const state = randomUUID();
  const redirectUri = `${getSiteUrl(request)}/api/strava/callback`;
  const authorizeUrl = buildStravaAuthorizeUrl(redirectUri, state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
