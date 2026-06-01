export const runQueryKeys = {
  list: (challengeId: string, userId?: string) =>
    ["runs", challengeId, userId ?? "all"] as const,
  detail: (runId: string) => ["runs", "detail", runId] as const,
};

export function invalidateRunRelatedQueries(
  queryClient: {
    invalidateQueries: (options: { queryKey: readonly unknown[] }) => void;
  },
  challengeId: string,
) {
  queryClient.invalidateQueries({ queryKey: ["runs", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["journey", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["feed", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["leaderboard", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["challenge", "current"] });
  queryClient.invalidateQueries({ queryKey: ["challenge", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["milestones", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["leaderboard", challengeId] });
  queryClient.invalidateQueries({ queryKey: ["badges", "me"] });
  queryClient.invalidateQueries({ queryKey: ["badges", "catalog"] });
}
