import type {
  StravaConnectionDTO,
  StravaImportResultDTO,
} from "@/lib/types/strava";
import type { StravaImportInput } from "@/lib/validators/strava";

type StravaStatusResponse = StravaConnectionDTO & {
  configured: boolean;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error?.message ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function getStravaStatus(): Promise<StravaStatusResponse> {
  const response = await fetch("/api/strava/status");

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function disconnectStrava(): Promise<void> {
  const response = await fetch("/api/strava/disconnect", {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseError(response));
  }
}

export async function importStravaActivities(
  input: StravaImportInput,
): Promise<StravaImportResultDTO> {
  const response = await fetch("/api/strava/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
