import type { BadgeCategory, BadgeRarity } from "@/lib/constants/badges";

export type BadgeDTO = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: BadgeRarity;
  category: BadgeCategory;
  sortOrder: number;
};

export type UserBadgeDTO = BadgeDTO & {
  unlockedAt: string;
};

export type BadgeCatalogEntry = BadgeDTO & {
  unlocked: boolean;
  unlockedAt: string | null;
};
