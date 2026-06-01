import type { RunDetailDTO, RunDTO } from "@/lib/types/run";
import type { CreateRunInput, UpdateRunInput } from "@/lib/validators/run";

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

function idempotencyHeaders(key?: string): HeadersInit {
  return {
    "Idempotency-Key": key ?? crypto.randomUUID(),
  };
}

export async function listRuns(params: {
  challengeId: string;
  userId?: string;
  cursor?: string;
  limit?: number;
}): Promise<{ runs: RunDTO[]; nextCursor: string | null }> {
  const search = new URLSearchParams({ challengeId: params.challengeId });
  if (params.userId) search.set("userId", params.userId);
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.limit) search.set("limit", String(params.limit));

  const response = await fetch(`/api/runs?${search.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function getRun(runId: string): Promise<RunDetailDTO> {
  const response = await fetch(`/api/runs/${runId}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createRun(
  input: CreateRunInput,
  options?: { idempotency?: boolean; idempotencyKey?: string },
): Promise<RunDTO> {
  const response = await fetch("/api/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.idempotency || options?.idempotencyKey
        ? idempotencyHeaders(options.idempotencyKey)
        : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateRun(
  runId: string,
  input: UpdateRunInput,
): Promise<RunDTO> {
  const response = await fetch(`/api/runs/${runId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function deleteRun(runId: string): Promise<void> {
  const response = await fetch(`/api/runs/${runId}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function uploadRunPhotos(
  runId: string,
  files: {
    original: File;
    thumbnail: File;
    width: number;
    height: number;
  }[],
): Promise<void> {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`photo_${index}`, file.original);
    formData.append(`photo_${index}_thumb`, file.thumbnail);
    formData.append(`photo_${index}_width`, String(file.width));
    formData.append(`photo_${index}_height`, String(file.height));
  });

  const response = await fetch(`/api/runs/${runId}/photos`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function deleteRunPhoto(
  runId: string,
  photoId: string,
): Promise<void> {
  const response = await fetch(`/api/runs/${runId}/photos/${photoId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
