import type { MilestoneDTO } from "@/lib/types/milestone";

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

export async function listMilestones(
  challengeId: string,
): Promise<{ milestones: MilestoneDTO[] }> {
  const response = await fetch(
    `/api/milestones?challengeId=${encodeURIComponent(challengeId)}`,
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function forceMilestone(input: {
  challengeId: string;
  journeyNodeId: string;
}): Promise<MilestoneDTO> {
  const response = await fetch("/api/milestones/force", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
