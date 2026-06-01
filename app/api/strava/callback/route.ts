import { type NextRequest, NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/auth/site-url";
import { exchangeStravaCode } from "@/features/strava/lib/strava-api";
import { isStravaConfigured } from "@/features/strava/lib/strava-config";
import { saveStravaTokens } from "@/features/strava/lib/strava-account-service";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "strava_oauth_state";

export async function GET(request: NextRequest) {
  const origin = getSiteUrl(request);
  const settingsUrl = `${origin}/app/settings`;

  if (!isStravaConfigured()) {
    return NextResponse.redirect(
      `${settingsUrl}?strava=error&message=${encodeURIComponent("Strava is not configured")}`,
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  const response = NextResponse.redirect(`${settingsUrl}?strava=connected`);
  response.cookies.delete(STATE_COOKIE);

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      `${settingsUrl}?strava=error&message=${encodeURIComponent("Invalid OAuth state")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent("/app/settings")}`,
    );
  }

  try {
    const token = await exchangeStravaCode(code);
    await saveStravaTokens(supabase, user.id, token);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect Strava";
    return NextResponse.redirect(
      `${settingsUrl}?strava=error&message=${encodeURIComponent(message)}`,
    );
  }
}
