import type { BadgeCatalogEntry, UserBadgeDTO } from "@/lib/types/badge";

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

export async function listUserBadges(): Promise<{ badges: UserBadgeDTO[] }> {
  const response = await fetch("/api/badges");

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function listBadgeCatalog(): Promise<{
  badges: BadgeCatalogEntry[];
}> {
  const response = await fetch("/api/badges/catalog");

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
