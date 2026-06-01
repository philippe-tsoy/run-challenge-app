"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getCurrentChallenge,
  listChallenges,
} from "@/features/challenges/lib/api";
import type { ChallengeStatusFilter } from "@/lib/validators/challenge";

export function useCurrentChallenge() {
  return useQuery({
    queryKey: ["challenge", "current"],
    queryFn: getCurrentChallenge,
  });
}

export function useChallenges(status: ChallengeStatusFilter = "all") {
  return useQuery({
    queryKey: ["challenge", "list", status],
    queryFn: () => listChallenges(status),
  });
}
