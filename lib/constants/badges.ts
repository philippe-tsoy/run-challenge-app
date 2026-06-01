/**
 * =====================================================
 * RUN CHALLENGE PWA
 * BADGE DEFINITIONS
 * =====================================================
 *
 * Single source of truth for:
 * - Badge metadata
 * - Unlock criteria
 * - Display order
 * - Rarity
 * - Admin tooling
 * - Future badge expansion
 *
 * Database badge codes MUST match these ids.
 */

export type BadgeRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type BadgeCategory =
  | "distance"
  | "streak"
  | "consistency"
  | "social"
  | "challenge"
  | "special";

export type BadgeDefinition = {
  id: string;

  name: string;

  description: string;

  icon: string;

  rarity: BadgeRarity;

  category: BadgeCategory;

  sortOrder: number;

  hidden: boolean;

  criteria: {
    type:
      | "first_run"
      | "distance_total"
      | "streak_days"
      | "run_count"
      | "social_score"
      | "challenge_completion"
      | "special";

    value?: number;
  };
};

/**
 * =====================================================
 * BADGES
 * =====================================================
 */

export const BADGES: BadgeDefinition[] = [
  {
    id: "FIRST_RUN",

    name: "First Steps",

    description:
      "Complete your very first run.",

    icon: "footprints",

    rarity: "common",

    category: "distance",

    sortOrder: 1,

    hidden: false,

    criteria: {
      type: "first_run",
    },
  },

  {
    id: "TEN_KM",

    name: "10 KM Club",

    description:
      "Accumulate 10 km of total distance.",

    icon: "target",

    rarity: "common",

    category: "distance",

    sortOrder: 2,

    hidden: false,

    criteria: {
      type: "distance_total",
      value: 10,
    },
  },

  {
    id: "TWENTY_FIVE_KM",

    name: "25 KM Club",

    description:
      "Accumulate 25 km of total distance.",

    icon: "mountain",

    rarity: "uncommon",

    category: "distance",

    sortOrder: 3,

    hidden: false,

    criteria: {
      type: "distance_total",
      value: 25,
    },
  },

  {
    id: "FIFTY_KM",

    name: "50 KM Club",

    description:
      "Accumulate 50 km of total distance.",

    icon: "medal",

    rarity: "rare",

    category: "distance",

    sortOrder: 4,

    hidden: false,

    criteria: {
      type: "distance_total",
      value: 50,
    },
  },

  {
    id: "ONE_HUNDRED_KM",

    name: "100 KM Club",

    description:
      "Accumulate 100 km of total distance.",

    icon: "trophy",

    rarity: "epic",

    category: "distance",

    sortOrder: 5,

    hidden: false,

    criteria: {
      type: "distance_total",
      value: 100,
    },
  },

  {
    id: "MARATHON_RUNNER",

    name: "Marathon Runner",

    description:
      "Accumulate 42.2 km of total distance.",

    icon: "flag",

    rarity: "rare",

    category: "distance",

    sortOrder: 6,

    hidden: false,

    criteria: {
      type: "distance_total",
      value: 42.2,
    },
  },

  {
    id: "THREE_DAY_STREAK",

    name: "Consistency",

    description:
      "Run 3 consecutive days.",

    icon: "calendar",

    rarity: "uncommon",

    category: "streak",

    sortOrder: 7,

    hidden: false,

    criteria: {
      type: "streak_days",
      value: 3,
    },
  },

  {
    id: "WEEKLY_WARRIOR",

    name: "Weekly Warrior",

    description:
      "Run 7 consecutive days.",

    icon: "flame",

    rarity: "rare",

    category: "streak",

    sortOrder: 8,

    hidden: false,

    criteria: {
      type: "streak_days",
      value: 7,
    },
  },

  /**
   * =====================================================
   * SOCIAL BADGES
   * =====================================================
   */

  {
    id: "CONVERSATION_STARTER",

    name: "Conversation Starter",

    description:
      "Receive 10 comments across your runs.",

    icon: "message-circle",

    rarity: "uncommon",

    category: "social",

    sortOrder: 20,

    hidden: false,

    criteria: {
      type: "social_score",
      value: 10,
    },
  },

  {
    id: "CROWD_FAVORITE",

    name: "Crowd Favorite",

    description:
      "Receive 25 reactions across your runs.",

    icon: "heart",

    rarity: "rare",

    category: "social",

    sortOrder: 21,

    hidden: false,

    criteria: {
      type: "social_score",
      value: 25,
    },
  },

  /**
   * =====================================================
   * PARTICIPATION BADGES
   * =====================================================
   */

  {
    id: "TEN_RUNS",

    name: "Steady Runner",

    description:
      "Complete 10 runs.",

    icon: "repeat",

    rarity: "uncommon",

    category: "consistency",

    sortOrder: 30,

    hidden: false,

    criteria: {
      type: "run_count",
      value: 10,
    },
  },

  {
    id: "TWENTY_FIVE_RUNS",

    name: "Endurance Machine",

    description:
      "Complete 25 runs.",

    icon: "activity",

    rarity: "rare",

    category: "consistency",

    sortOrder: 31,

    hidden: false,

    criteria: {
      type: "run_count",
      value: 25,
    },
  },

  /**
   * =====================================================
   * CHALLENGE BADGES
   * =====================================================
   */

  {
    id: "FELLOWSHIP_MEMBER",

    name: "Fellowship Member",

    description:
      "Participate in a challenge.",

    icon: "users",

    rarity: "common",

    category: "challenge",

    sortOrder: 40,

    hidden: false,

    criteria: {
      type: "challenge_completion",
      value: 1,
    },
  },

  {
    id: "RIVENDELL_REACHED",

    name: "Rivendell Reached",

    description:
      "Help the Fellowship reach Rivendell.",

    icon: "castle",

    rarity: "legendary",

    category: "challenge",

    sortOrder: 41,

    hidden: false,

    criteria: {
      type: "challenge_completion",
      value: 500,
    },
  },

  /**
   * =====================================================
   * SECRET BADGES
   * =====================================================
   */

  {
    id: "SECOND_BREAKFAST",

    name: "Second Breakfast",

    description:
      "A secret achievement.",

    icon: "cookie",

    rarity: "epic",

    category: "special",

    sortOrder: 100,

    hidden: true,

    criteria: {
      type: "special",
    },
  },
];

/**
 * =====================================================
 * LOOKUP MAP
 * =====================================================
 */

export const BADGE_MAP = Object.fromEntries(
  BADGES.map((badge) => [
    badge.id,
    badge,
  ])
);

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */

export function getBadgeById(
  badgeId: string
): BadgeDefinition | undefined {
  return BADGE_MAP[badgeId];
}

export function getVisibleBadges() {
  return BADGES.filter(
    (badge) => !badge.hidden
  ).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getHiddenBadges() {
  return BADGES.filter(
    (badge) => badge.hidden
  );
}

export function getBadgesByCategory(
  category: BadgeCategory
) {
  return BADGES.filter(
    (badge) => badge.category === category
  );
}

export function getBadgeProgress(
  currentValue: number,
  targetValue: number
) {
  return {
    current: currentValue,
    target: targetValue,
    percentage:
      Math.min(
        100,
        Math.round(
          (currentValue / targetValue) *
            100
        )
      ),
    completed:
      currentValue >= targetValue,
  };
}

/**
 * =====================================================
 * CHALLENGE AWARDS
 * (END OF CHALLENGE)
 * =====================================================
 */

export const CHALLENGE_AWARDS = [
  {
    code: "DISTANCE_CHAMPION",
    name: "Distance Champion",
  },

  {
    code: "PACE_KING",
    name: "Pace King",
  },

  {
    code: "MOST_RUNS",
    name: "Most Runs",
  },

  {
    code: "SOCIAL_BUTTERFLY",
    name: "Social Butterfly",
  },

  {
    code: "CONSISTENCY_CHAMPION",
    name: "Consistency Champion",
  },

  {
    code: "MVP",
    name: "Fellowship MVP",
  },
] as const;
