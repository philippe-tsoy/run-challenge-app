"use client";

import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import { LogRunFab } from "@/features/runs/components/log-run-fab";
import { QuickAddRunModal } from "@/features/runs/components/quick-add-run-modal";

export function AppRunShell() {
  const { data: challenge } = useCurrentChallenge();
  const challengeId = challenge?.id;

  if (!challengeId) {
    return null;
  }

  return (
    <>
      <LogRunFab challengeId={challengeId} />
      <QuickAddRunModal challengeId={challengeId} />
    </>
  );
}
