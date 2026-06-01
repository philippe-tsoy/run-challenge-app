"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  disconnectStrava,
  getStravaStatus,
  importStravaActivities,
} from "@/features/strava/lib/api";
import { invalidateRunRelatedQueries } from "@/features/runs/lib/query-keys";
import type { StravaImportInput } from "@/lib/validators/strava";

export function useStravaStatus() {
  return useQuery({
    queryKey: ["strava", "status"],
    queryFn: getStravaStatus,
  });
}

export function useStravaImport(challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<StravaImportInput, "challengeId">) =>
      importStravaActivities({ challengeId, ...input }),
    onSuccess: () => {
      invalidateRunRelatedQueries(queryClient, challengeId);
    },
  });
}

export function useStravaDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectStrava,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strava", "status"] });
    },
  });
}
