import type { FeedEventDTO } from "@/lib/types/feed";

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

export async function listFeed(params: {
  challengeId: string;
  cursor?: string;
  limit?: number;
}): Promise<{ events: FeedEventDTO[]; nextCursor: string | null }> {
  const search = new URLSearchParams({ challengeId: params.challengeId });
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.limit) search.set("limit", String(params.limit));

  const response = await fetch(`/api/feed?${search.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
