"use client";

import { useEffect, useRef, useState } from "react";

import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import { MilestoneCelebrationModal } from "@/features/milestones/components/milestone-celebration-modal";
import { useMilestones } from "@/features/milestones/hooks/use-milestones";
import {
  addSeenMilestoneIds,
  getSeenMilestoneIds,
  markAllMilestonesSeen,
} from "@/features/milestones/lib/seen-milestones";
import type { MilestoneDTO } from "@/lib/types/milestone";

export function MilestoneWatcher() {
  const { data: challenge } = useCurrentChallenge();
  const challengeId = challenge?.id ?? "";
  const { data } = useMilestones(challengeId);
  const initializedRef = useRef(false);
  const [queue, setQueue] = useState<MilestoneDTO[]>([]);

  useEffect(() => {
    if (!challengeId || !data?.milestones) {
      return;
    }

    if (!initializedRef.current) {
      markAllMilestonesSeen(
        challengeId,
        data.milestones.map((milestone) => milestone.id),
      );
      initializedRef.current = true;
      return;
    }

    const seen = getSeenMilestoneIds(challengeId);
    const newMilestones = data.milestones.filter(
      (milestone) => !seen.has(milestone.id),
    );

    if (newMilestones.length) {
      setQueue((current) => [...current, ...newMilestones]);
      addSeenMilestoneIds(
        challengeId,
        newMilestones.map((milestone) => milestone.id),
      );
    }
  }, [challengeId, data?.milestones]);

  function dismissCurrent() {
    setQueue((current) => current.slice(1));
  }

  if (!queue.length) {
    return null;
  }

  return (
    <MilestoneCelebrationModal milestones={queue} onDismiss={dismissCurrent} />
  );
}
