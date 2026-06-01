export type StravaConnectionDTO = {
  connected: boolean;
  athleteId: number | null;
  tokenExpiresAt: string | null;
};

export type StravaImportResultDTO = {
  imported: number;
  skippedDuplicates: number;
  skippedNonRun: number;
  skippedInvalid: number;
  skippedAlreadyImported: number;
};
