import type { JourneyDTO } from "@/lib/types/journey";

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

export async function getJourney(challengeId: string): Promise<JourneyDTO> {
  const response = await fetch(
    `/api/journey?challengeId=${encodeURIComponent(challengeId)}`,
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
