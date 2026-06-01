export type JourneyNodeStatus = "locked" | "passed" | "current" | "next";

export type JourneyNodeDTO = {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  kmMarker: number;
  sortOrder: number;
  mapX: number;
  mapY: number;
  imageUrl: string | null;
  status: JourneyNodeStatus;
  isExtended: boolean;
};

export type LeaderboardPreviewEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  value: number;
};

export type JourneyPersonalStats = {
  distanceKm: number;
  rank: number | null;
};

export type JourneyDTO = {
  challengeId: string;
  challengeName: string;
  isActive: boolean;
  teamDistanceKm: number;
  targetKm: number;
  progressToNext: number;
  questComplete: boolean;
  completionTitle: string;
  completionMessage: string;
  currentNode: JourneyNodeDTO;
  nextNode: JourneyNodeDTO | null;
  nodes: JourneyNodeDTO[];
  extendedNodes: JourneyNodeDTO[];
  extendedUnlocked: boolean;
  showExtendedMarkers: boolean;
  personalStats: JourneyPersonalStats;
  leaderboardPreview: LeaderboardPreviewEntry[];
};
