"use client";

import { useEffect, useRef, useState } from "react";

import { BadgeCelebrationModal } from "@/features/badges/components/badge-celebration-modal";
import { useUserBadges } from "@/features/badges/hooks/use-badges";
import {
  addSeenBadgeIds,
  getSeenBadgeIds,
  markAllBadgesSeen,
} from "@/features/badges/lib/seen-badges";
import type { UserBadgeDTO } from "@/lib/types/badge";

export function BadgeWatcher() {
  const { data } = useUserBadges();
  const initializedRef = useRef(false);
  const [queue, setQueue] = useState<UserBadgeDTO[]>([]);

  useEffect(() => {
    if (!data?.badges) {
      return;
    }

    if (!initializedRef.current) {
      markAllBadgesSeen(data.badges.map((badge) => badge.id));
      initializedRef.current = true;
      return;
    }

    const seen = getSeenBadgeIds();
    const newBadges = data.badges.filter((badge) => !seen.has(badge.id));

    if (newBadges.length) {
      setQueue((current) => [...current, ...newBadges]);
      addSeenBadgeIds(newBadges.map((badge) => badge.id));
    }
  }, [data?.badges]);

  if (!queue.length) {
    return null;
  }

  return (
    <BadgeCelebrationModal
      badges={queue}
      onDismiss={() => setQueue((current) => current.slice(1))}
    />
  );
}
