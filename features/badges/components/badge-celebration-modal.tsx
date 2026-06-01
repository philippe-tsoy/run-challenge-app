"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { UserBadgeDTO } from "@/lib/types/badge";

type BadgeCelebrationModalProps = {
  badges: UserBadgeDTO[];
  onDismiss: () => void;
};

function fireConfetti() {
  void import("canvas-confetti").then((module) => {
    module.default({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.65 },
    });
  });
}

export function BadgeCelebrationModal({
  badges,
  onDismiss,
}: BadgeCelebrationModalProps) {
  const current = badges[0];

  useEffect(() => {
    if (current) {
      fireConfetti();
    }
  }, [current?.id]);

  if (!current) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-card w-full max-w-md rounded-xl border p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-title"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-wide">
          Badge unlocked
        </p>
        <h2 id="badge-title" className="mt-2 text-2xl font-semibold">
          {current.name}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">
          {current.description}
        </p>
        <p className="text-muted-foreground mt-4 text-xs capitalize">
          {current.rarity} · {current.category}
        </p>

        {badges.length > 1 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            {badges.length - 1} more badge{badges.length > 2 ? "s" : ""} to view
          </p>
        ) : null}

        <Button className="mt-6 w-full" onClick={onDismiss}>
          {badges.length > 1 ? "Next badge" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
