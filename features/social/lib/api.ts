import type { CommentDTO, NotificationDTO, ReactionDTO } from "@/lib/types/social";
import type { ReactionType, ReactionsSummary } from "@/lib/types/social";

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

export async function createComment(
  runId: string,
  body: string,
): Promise<CommentDTO> {
  const response = await fetch(`/api/runs/${runId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function upsertReaction(
  runId: string,
  type: ReactionType,
): Promise<ReactionDTO> {
  const response = await fetch(`/api/runs/${runId}/reactions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function removeReaction(runId: string): Promise<void> {
  const response = await fetch(`/api/runs/${runId}/reactions`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function listNotifications(params?: {
  unreadOnly?: boolean;
  cursor?: string;
}): Promise<{
  notifications: NotificationDTO[];
  unreadCount: number;
  nextCursor: string | null;
}> {
  const search = new URLSearchParams();
  if (params?.unreadOnly) search.set("unreadOnly", "true");
  if (params?.cursor) search.set("cursor", params.cursor);

  const response = await fetch(`/api/notifications?${search.toString()}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function markNotificationsRead(options: {
  ids?: string[];
  all?: boolean;
}): Promise<void> {
  const response = await fetch("/api/notifications/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export type { ReactionsSummary };
