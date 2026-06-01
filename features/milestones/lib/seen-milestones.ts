const STORAGE_PREFIX = "run-app-seen-milestones";

function storageKey(challengeId: string): string {
  return `${STORAGE_PREFIX}:${challengeId}`;
}

export function getSeenMilestoneIds(challengeId: string): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = sessionStorage.getItem(storageKey(challengeId));
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function addSeenMilestoneIds(
  challengeId: string,
  ids: string[],
): void {
  if (typeof window === "undefined" || !ids.length) {
    return;
  }

  const seen = getSeenMilestoneIds(challengeId);
  ids.forEach((id) => seen.add(id));
  sessionStorage.setItem(
    storageKey(challengeId),
    JSON.stringify([...seen]),
  );
}

export function markAllMilestonesSeen(
  challengeId: string,
  ids: string[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(storageKey(challengeId), JSON.stringify(ids));
}
