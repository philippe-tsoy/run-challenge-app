import type { ChallengeDetailDTO, ChallengeDTO } from "@/lib/types/challenge";
import type {
  ChallengeStatusFilter,
  CreateChallengeInput,
} from "@/lib/validators/challenge";

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

export async function getCurrentChallenge(): Promise<ChallengeDTO | null> {
  const response = await fetch("/api/challenges/current");
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function listChallenges(
  status: ChallengeStatusFilter = "all",
): Promise<{ challenges: ChallengeDTO[] }> {
  const response = await fetch(`/api/challenges?status=${status}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function getChallenge(
  id: string,
): Promise<ChallengeDetailDTO> {
  const response = await fetch(`/api/challenges/${id}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function createChallenge(
  input: CreateChallengeInput,
): Promise<ChallengeDTO> {
  const response = await fetch("/api/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
