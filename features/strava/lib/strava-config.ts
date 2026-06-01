export const STRAVA_OAUTH_SCOPES = "activity:read_all";

export const STRAVA_ALLOWED_ACTIVITY_TYPES = new Set([
  "Run",
  "VirtualRun",
  "TrailRun",
]);

export function getStravaClientId(): string | null {
  return process.env.STRAVA_CLIENT_ID ?? null;
}

export function getStravaClientSecret(): string | null {
  return process.env.STRAVA_CLIENT_SECRET ?? null;
}

export function isStravaConfigured(): boolean {
  return Boolean(getStravaClientId() && getStravaClientSecret());
}

export function requireStravaConfig(): { clientId: string; clientSecret: string } {
  const clientId = getStravaClientId();
  const clientSecret = getStravaClientSecret();

  if (!clientId || !clientSecret) {
    throw Object.assign(new Error("STRAVA_NOT_CONFIGURED"), {
      code: "STRAVA_NOT_CONFIGURED",
    });
  }

  return { clientId, clientSecret };
}
