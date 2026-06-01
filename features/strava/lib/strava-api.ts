import {
  requireStravaConfig,
  STRAVA_OAUTH_SCOPES,
} from "@/features/strava/lib/strava-config";

const STRAVA_OAUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: {
    id: number;
  };
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
};

export function buildStravaAuthorizeUrl(
  redirectUri: string,
  state: string,
): string {
  const { clientId } = requireStravaConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "auto",
    scope: STRAVA_OAUTH_SCOPES,
    state,
  });

  return `${STRAVA_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeStravaCode(
  code: string,
): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = requireStravaConfig();

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect Strava account");
  }

  return response.json();
}

export async function refreshStravaToken(
  refreshToken: string,
): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = requireStravaConfig();

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  return response.json();
}

export async function fetchStravaActivities(
  accessToken: string,
  options: { afterEpoch: number; page?: number },
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({
    after: String(options.afterEpoch),
    page: String(options.page ?? 1),
    per_page: "50",
  });

  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Strava activities");
  }

  return response.json();
}
