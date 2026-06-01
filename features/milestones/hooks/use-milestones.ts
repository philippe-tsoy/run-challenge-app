"use client";

import { useQuery } from "@tanstack/react-query";

import { listMilestones } from "@/features/milestones/lib/api";

export function useMilestones(challengeId: string) {
  return useQuery({
    queryKey: ["milestones", challengeId],
    queryFn: () => listMilestones(challengeId),
    enabled: Boolean(challengeId),
  });
}
