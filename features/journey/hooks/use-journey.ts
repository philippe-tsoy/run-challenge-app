"use client";

import { useQuery } from "@tanstack/react-query";

import { getJourney } from "@/features/journey/lib/api";

export function useJourney(challengeId: string) {
  return useQuery({
    queryKey: ["journey", challengeId],
    queryFn: () => getJourney(challengeId),
    enabled: Boolean(challengeId),
  });
}
