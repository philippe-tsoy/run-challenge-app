const STORAGE_KEY = "run-app-seen-badges";

export function getSeenBadgeIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }

    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markAllBadgesSeen(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function addSeenBadgeIds(ids: string[]): void {
  if (typeof window === "undefined" || !ids.length) {
    return;
  }

  const seen = getSeenBadgeIds();
  ids.forEach((id) => seen.add(id));
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}
