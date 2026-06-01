/**
 * =====================================================
 * RUN CHALLENGE PWA
 * RANKING TYPES
 * =====================================================
 *
 * Single source of truth for:
 * - Leaderboards
 * - Awards
 * - Rankings
 * - Challenge Results
 *
 * Backend ranking functions should mirror these ids.
 */

export type RankingDirection =
  | "asc"
  | "desc";

export type RankingCategory =
  | "performance"
  | "participation"
  | "social"
  | "consistency";

export type RankingType = {
  id: string;

  name: string;

  description: string;

  category: RankingCategory;

  direction: RankingDirection;

  minimumQualification?: {
    type:
      | "distance"
      | "runs"
      | "streak";

    value: number;
  };

  unit: string;

  awardCode?: string;

  enabled: boolean;

  visible: boolean;
};

export const RANKING_TYPES: RankingType[] = [
  /**
   * =====================================================
   * DISTANCE
   * =====================================================
   */

  {
    id: "distance",

    name: "Distance",

    description:
      "Most cumulative kilometers logged.",

    category: "participation",

    direction: "desc",

    unit: "km",

    awardCode: "DISTANCE_CHAMPION",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * RUN COUNT
   * =====================================================
   */

  {
    id: "run_count",

    name: "Run Count",

    description:
      "Most runs completed.",

    category: "participation",

    direction: "desc",

    unit: "runs",

    awardCode: "MOST_RUNS",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * AVERAGE PACE
   * =====================================================
   */

  {
    id: "average_pace",

    name: "Average Pace",

    description:
      "Fastest average pace across all runs.",

    category: "performance",

    direction: "asc",

    minimumQualification: {
      type: "distance",
      value: 10,
    },

    unit: "min/km",

    awardCode: "PACE_KING",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * BEST PACE
   * =====================================================
   */

  {
    id: "best_pace",

    name: "Best Pace",

    description:
      "Fastest qualifying run pace.",

    category: "performance",

    direction: "asc",

    minimumQualification: {
      type: "distance",
      value: 2,
    },

    unit: "min/km",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * CURRENT STREAK
   * =====================================================
   */

  {
    id: "streak",

    name: "Current Streak",

    description:
      "Most consecutive running days.",

    category: "consistency",

    direction: "desc",

    unit: "days",

    awardCode: "CONSISTENCY_CHAMPION",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * LONGEST STREAK
   * =====================================================
   */

  {
    id: "longest_streak",

    name: "Longest Streak",

    description:
      "Longest streak achieved during the challenge.",

    category: "consistency",

    direction: "desc",

    unit: "days",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * SOCIAL SCORE
   * =====================================================
   */

  {
    id: "social_score",

    name: "Social Score",

    description:
      "Comments and reactions contributed.",

    category: "social",

    direction: "desc",

    unit: "points",

    awardCode: "SOCIAL_BUTTERFLY",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * DISTANCE PER RUN
   * =====================================================
   */

  {
    id: "distance_per_run",

    name: "Distance Per Run",

    description:
      "Highest average distance per run.",

    category: "performance",

    direction: "desc",

    minimumQualification: {
      type: "runs",
      value: 5,
    },

    unit: "km/run",

    enabled: true,

    visible: true,
  },

  /**
   * =====================================================
   * TOTAL TIME
   * =====================================================
   */

  {
    id: "total_time",

    name: "Total Time",

    description:
      "Most total running time logged.",

    category: "participation",

    direction: "desc",

    unit: "minutes",

    enabled: true,

    visible: true,
  },
];

/**
 * =====================================================
 * LOOKUPS
 * =====================================================
 */

export const RANKING_MAP = Object.fromEntries(
  RANKING_TYPES.map((ranking) => [
    ranking.id,
    ranking,
  ])
);

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */

export function getRankingType(
  id: string
): RankingType | undefined {
  return RANKING_MAP[id];
}

export function getVisibleRankings() {
  return RANKING_TYPES.filter(
    (ranking) => ranking.visible
  );
}

export function getRankingCategories() {
  return [
    "performance",
    "participation",
    "social",
    "consistency",
  ] as const;
}

export function getRankingsByCategory(
  category: RankingCategory
) {
  return RANKING_TYPES.filter(
    (ranking) => ranking.category === category
  );
}

export function getAwardRankings() {
  return RANKING_TYPES.filter(
    (ranking) => ranking.awardCode
  );
}

/**
 * =====================================================
 * UI DEFAULTS
 * =====================================================
 */

export const DEFAULT_RANKING = "distance";

export const LEADERBOARD_TABS = [
  "distance",
  "run_count",
  "average_pace",
  "best_pace",
  "streak",
  "social_score",
] as const;

/**
 * =====================================================
 * AWARD MAPPINGS
 * =====================================================
 */

export const AWARD_RANKINGS = {
  DISTANCE_CHAMPION: "distance",
  MOST_RUNS: "run_count",
  PACE_KING: "average_pace",
  SOCIAL_BUTTERFLY: "social_score",
  CONSISTENCY_CHAMPION: "longest_streak",
} as const;

/**
 * =====================================================
 * MVP SCORE
 * =====================================================
 *
 * Used to calculate Fellowship MVP.
 *
 * Formula intentionally weighted toward
 * participation while still rewarding
 * consistency and social engagement.
 */

export function calculateMvpScore({
  distanceKm,
  runCount,
  longestStreak,
  socialScore,
}: {
  distanceKm: number;
  runCount: number;
  longestStreak: number;
  socialScore: number;
}) {
  return (
    distanceKm * 1 +
    runCount * 2 +
    longestStreak * 5 +
    socialScore * 0.5
  );
}
