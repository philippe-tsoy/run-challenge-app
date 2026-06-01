export type ChallengeDTO = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  targetKm: number;
  isActive: boolean;
  teamDistanceKm: number;
};

export type ChallengeDetailDTO = ChallengeDTO & {
  participantCount: number;
  journeyNodeCount: number;
  progressPercent: number;
  themeCode: string | null;
};

export type ChallengeRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  target_km: number;
  is_active: boolean;
  theme_id: string | null;
  config: Record<string, unknown> | null;
};

export type ChallengeThemeRow = {
  id: string;
  code: string;
};
