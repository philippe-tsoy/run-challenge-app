import type { AdminUserDTO } from "@/features/admin/lib/admin-users-service";
import type { InviteCodeDTO } from "@/features/admin/lib/admin-invites-service";
import type { RunDTO } from "@/lib/types/run";
import type { ChallengeDTO } from "@/lib/types/challenge";
import type {
  CreateInviteInput,
  UpdateInviteInput,
} from "@/lib/validators/admin";

type ApiErrorResponse = {
  error?: { message?: string };
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error?.message ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function listAdminUsers(): Promise<{ users: AdminUserDTO[] }> {
  const response = await fetch("/api/admin/users");
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function setAdminRole(
  userId: string,
  action: "grant" | "revoke",
): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function removeUserFromChallenge(
  userId: string,
  challengeId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/users/${userId}?challengeId=${challengeId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function listInviteCodes(): Promise<{ invites: InviteCodeDTO[] }> {
  const response = await fetch("/api/admin/invites");
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function createInviteCode(
  input: CreateInviteInput,
): Promise<InviteCodeDTO> {
  const response = await fetch("/api/admin/invites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function updateInviteCode(
  inviteId: string,
  input: UpdateInviteInput,
): Promise<InviteCodeDTO> {
  const response = await fetch(`/api/admin/invites/${inviteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function closeChallengeEarly(
  challengeId: string,
): Promise<ChallengeDTO> {
  const response = await fetch(`/api/challenges/${challengeId}/close`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function invalidateRun(
  runId: string,
  reason: string,
): Promise<RunDTO> {
  const response = await fetch(`/api/runs/${runId}/invalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function restoreRun(runId: string): Promise<RunDTO> {
  const response = await fetch(`/api/runs/${runId}/restore`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export type AuditLogEntryDTO = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    displayName: string | null;
  } | null;
};

export async function listAuditLog(limit = 50): Promise<{
  entries: AuditLogEntryDTO[];
}> {
  const response = await fetch(`/api/admin/audit-log?limit=${limit}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
