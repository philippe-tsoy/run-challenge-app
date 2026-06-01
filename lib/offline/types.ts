export type PendingRunRecord = {
  clientOperationId: string;
  challengeId: string;
  distanceKm: number;
  durationMin: number;
  notes: string | null;
  queuedAt: string;
};
