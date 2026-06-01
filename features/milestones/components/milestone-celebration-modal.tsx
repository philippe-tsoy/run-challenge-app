"use client";

import Image from "next/image";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { MilestoneDTO } from "@/lib/types/milestone";

type MilestoneCelebrationModalProps = {
  milestones: MilestoneDTO[];
  onDismiss: () => void;
};

function fireConfetti() {
  void import("canvas-confetti").then((module) => {
    const confetti = module.default;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.65 },
    });
  });
}

export function MilestoneCelebrationModal({
  milestones,
  onDismiss,
}: MilestoneCelebrationModalProps) {
  const current = milestones[0];

  useEffect(() => {
    if (!current?.confetti) {
      return;
    }

    fireConfetti();
  }, [current?.confetti, current?.id]);

  if (!current) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-card w-full max-w-md rounded-xl border p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-title"
      >
        <p className="text-primary text-sm font-medium uppercase tracking-wide">
          Milestone reached
        </p>
        {current.imageUrl ? (
          <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-lg border">
            <Image
              src={current.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>
        ) : null}
        <h2 id="milestone-title" className="mt-2 text-2xl font-semibold">
          {current.title}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">{current.message}</p>
        <p className="text-muted-foreground mt-4 text-xs">
          {current.nodeName} · {current.kmMarker} km
        </p>

        {milestones.length > 1 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            {milestones.length - 1} more milestone
            {milestones.length > 2 ? "s" : ""} to celebrate
          </p>
        ) : null}

        <Button className="mt-6 w-full" onClick={onDismiss}>
          {milestones.length > 1 ? "Next milestone" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
