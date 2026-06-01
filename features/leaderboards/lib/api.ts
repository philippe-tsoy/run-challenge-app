import type { LeaderboardDTO, LeaderboardMode } from "@/lib/types/leaderboard";

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

export async function getLeaderboard(
  challengeId: string,
  mode: LeaderboardMode,
): Promise<LeaderboardDTO> {
  const params = new URLSearchParams({
    challengeId,
    mode,
  });

  const response = await fetch(`/api/leaderboards?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
