import { getJourneyImageSrc } from "@/lib/constants/journey-images";

/**
 * =====================================================
 * RUN CHALLENGE PWA
 * LOTR JOURNEY CONFIGURATION
 * =====================================================
 *
 * Single source of truth for:
 * - Journey progression
 * - Milestone celebrations
 * - Map coordinates
 * - Narrative content
 * - Future theme expansion
 *
 * Database should mirror this data.
 */

export type JourneyNode = {
  id: string;
  name: string;
  subtitle: string;
  description: string;

  kmMarker: number;
  order: number;

  map: {
    x: number;
    y: number;
  };

  image: string;

  celebration: {
    title: string;
    message: string;
    confetti: boolean;
  };
};

export type JourneyTheme = {
  id: string;
  name: string;
  targetKm: number;

  completionTitle: string;
  completionMessage: string;

  nodes: JourneyNode[];
};

export const LOTR_THEME: JourneyTheme = {
  id: "lotr",

  name: "The Fellowship Journey",

  targetKm: 500,

  completionTitle: "Rivendell Reached",

  completionMessage:
    "The Fellowship has successfully reached Rivendell. The challenge continues until the end date, but the primary quest is complete.",

  nodes: [
    {
      id: "hobbiton",

      name: "Hobbiton",

      subtitle: "The Journey Begins",

      description:
        "Every great adventure starts with a single step. The Fellowship departs from Hobbiton.",

      kmMarker: 0,

      order: 1,

      map: {
        x: 5,
        y: 50,
      },

      image: getJourneyImageSrc("hobbiton"),

      celebration: {
        title: "Adventure Awaits",
        message:
          "The Fellowship has assembled. Time to begin the journey.",
        confetti: true,
      },
    },

    {
      id: "buckland",

      name: "Buckland",

      subtitle: "Brandywine Crossing",

      description:
        "The Fellowship crosses the Brandywine River and leaves familiar lands behind.",

      kmMarker: 30,

      order: 2,

      map: {
        x: 18,
        y: 48,
      },

      image: getJourneyImageSrc("buckland"),

      celebration: {
        title: "First Milestone Reached",
        message:
          "The Fellowship has crossed the Brandywine. Momentum is building.",
        confetti: true,
      },
    },

    {
      id: "old-forest",

      name: "Old Forest",

      subtitle: "Into the Woods",

      description:
        "The path becomes less certain as the Fellowship enters the mysterious Old Forest.",

      kmMarker: 90,

      order: 3,

      map: {
        x: 33,
        y: 45,
      },

      image: getJourneyImageSrc("old-forest"),

      celebration: {
        title: "Deep Into the Journey",
        message:
          "The Fellowship enters the Old Forest. Keep moving forward.",
        confetti: true,
      },
    },

    {
      id: "bree",

      name: "Bree",

      subtitle: "The Prancing Pony",

      description:
        "A welcome rest stop and a chance to gather strength for the road ahead.",

      kmMarker: 150,

      order: 4,

      map: {
        x: 46,
        y: 43,
      },

      image: getJourneyImageSrc("bree"),

      celebration: {
        title: "Welcome to Bree",
        message:
          "The Fellowship has arrived safely in Bree. Excellent progress.",
        confetti: true,
      },
    },

    {
      id: "weathertop",

      name: "Weathertop",

      subtitle: "The Great Climb",

      description:
        "The road becomes steeper and more demanding. Perseverance matters now.",

      kmMarker: 225,

      order: 5,

      map: {
        x: 63,
        y: 37,
      },

      image: getJourneyImageSrc("weathertop"),

      celebration: {
        title: "Weathertop Conquered",
        message:
          "The Fellowship has overcome one of the toughest sections of the route.",
        confetti: true,
      },
    },

    {
      id: "ford-of-bruinen",

      name: "Ford of Bruinen",

      subtitle: "The Final Push",

      description:
        "Rivendell is now within reach. Every kilometer counts.",

      kmMarker: 310,

      order: 6,

      map: {
        x: 80,
        y: 30,
      },

      image: getJourneyImageSrc("ford-of-bruinen"),

      celebration: {
        title: "Almost There",
        message:
          "The Fellowship has crossed the Ford. Rivendell lies ahead.",
        confetti: true,
      },
    },

    {
      id: "rivendell",

      name: "Rivendell",

      subtitle: "Journey Complete",

      description:
        "The Fellowship reaches Rivendell. The primary quest is complete.",

      kmMarker: 500,

      order: 7,

      map: {
        x: 95,
        y: 20,
      },

      image: getJourneyImageSrc("rivendell"),

      celebration: {
        title: "Rivendell Reached",
        message:
          "The Fellowship has completed the journey from Hobbiton to Rivendell.",
        confetti: true,
      },
    },
  ],
};

/**
 * =====================================================
 * HELPERS
 * =====================================================
 */

export function getCurrentJourneyNode(
  totalKm: number
): JourneyNode {
  const unlocked = LOTR_THEME.nodes.filter(
    (node) => totalKm >= node.kmMarker
  );

  return unlocked[unlocked.length - 1] ?? LOTR_THEME.nodes[0];
}

export function getNextJourneyNode(
  totalKm: number
): JourneyNode | null {
  return (
    LOTR_THEME.nodes.find(
      (node) => node.kmMarker > totalKm
    ) ?? null
  );
}

export function getJourneyProgress(
  totalKm: number
) {
  const current = getCurrentJourneyNode(totalKm);
  const next = getNextJourneyNode(totalKm);

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      completed: true,
    };
  }

  const segmentDistance =
    next.kmMarker - current.kmMarker;

  const segmentProgress =
    totalKm - current.kmMarker;

  const progressPercent =
    segmentDistance === 0
      ? 100
      : Math.min(
          100,
          (segmentProgress / segmentDistance) * 100
        );

  return {
    current,
    next,
    progressPercent,
    completed: false,
  };
}

/**
 * Used by challenge overview card.
 */
export function getChallengeProgress(
  totalKm: number,
  targetKm = 500
) {
  return {
    distance: totalKm,

    target: targetKm,

    percent:
      Math.round(
        (totalKm / targetKm) * 100 * 100
      ) / 100,

    cappedPercent:
      Math.min(
        100,
        Math.round(
          (totalKm / targetKm) * 100 * 100
        ) / 100
      ),

    exceededGoal:
      totalKm > targetKm,
  };
}
