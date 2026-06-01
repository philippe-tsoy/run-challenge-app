import type { SupabaseClient } from "@supabase/supabase-js";

import {
  BADGE_MAP,
  getVisibleBadges,
  type BadgeDefinition,
} from "@/lib/constants/badges";
import type { BadgeCatalogEntry, BadgeDTO, UserBadgeDTO } from "@/lib/types/badge";

type BadgeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
};

type UserBadgeRow = {
  unlocked_at: string;
  badges: BadgeRow | BadgeRow[];
};

function enrichBadge(row: BadgeRow): BadgeDTO {
  const definition = BADGE_MAP[row.code] as BadgeDefinition | undefined;

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    icon: row.icon ?? definition?.icon ?? null,
    rarity: definition?.rarity ?? "common",
    category: definition?.category ?? "special",
    sortOrder: definition?.sortOrder ?? 999,
  };
}

function extractBadge(row: UserBadgeRow): BadgeRow {
  const badge = row.badges;
  return Array.isArray(badge) ? badge[0] : badge;
}

export async function listBadgeCatalog(
  supabase: SupabaseClient,
  userId: string,
): Promise<BadgeCatalogEntry[]> {
  const { data: unlockedRows, error: unlockedError } = await supabase
    .from("user_badges")
    .select("unlocked_at, badges(id, code, name, description, icon)")
    .eq("user_id", userId);

  if (unlockedError) {
    throw unlockedError;
  }

  const unlockedMap = new Map<string, string>();
  for (const row of unlockedRows ?? []) {
    const badge = extractBadge(row as UserBadgeRow);
    unlockedMap.set(badge.code, row.unlocked_at);
  }

  const { data: dbBadges, error: dbError } = await supabase
    .from("badges")
    .select("id, code, name, description, icon")
    .order("code");

  if (dbError) {
    throw dbError;
  }

  const dbByCode = new Map(
    (dbBadges ?? []).map((row) => [row.code, row as BadgeRow]),
  );

  const catalog: BadgeCatalogEntry[] = getVisibleBadges().map((definition) => {
    const row = dbByCode.get(definition.id);
    const unlockedAt = unlockedMap.get(definition.id) ?? null;

    if (row) {
      return {
        ...enrichBadge(row),
        unlocked: Boolean(unlockedAt),
        unlockedAt,
      };
    }

    return {
      id: definition.id,
      code: definition.id,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      rarity: definition.rarity,
      category: definition.category,
      sortOrder: definition.sortOrder,
      unlocked: Boolean(unlockedAt),
      unlockedAt,
    };
  });

  return catalog.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listUserBadges(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserBadgeDTO[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("unlocked_at, badges(id, code, name, description, icon)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const badge = enrichBadge(extractBadge(row as UserBadgeRow));
    return {
      ...badge,
      unlockedAt: row.unlocked_at,
    };
  });
}
