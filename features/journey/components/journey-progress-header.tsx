import Link from "next/link";

import type { JourneyDTO } from "@/lib/types/journey";

type JourneyProgressHeaderProps = {
  journey: JourneyDTO;
};

export function JourneyProgressHeader({ journey }: JourneyProgressHeaderProps) {
  const cappedPercent = Math.min(
    100,
    journey.targetKm > 0
      ? (journey.teamDistanceKm / journey.targetKm) * 100
      : 0,
  );

  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-sm">Team progress</p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {journey.challengeName}
            </h1>
            <Link
              href={`/app/challenges/${journey.challengeId}`}
              className="text-primary shrink-0 text-sm font-medium underline-offset-4 hover:underline"
            >
              Challenge details & runs
            </Link>
          </div>
        </div>
        {journey.isActive ? (
          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
            Historical
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {journey.teamDistanceKm.toFixed(1)} / {journey.targetKm} km
          </span>
          <span className="font-medium">{cappedPercent.toFixed(0)}%</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${cappedPercent}%` }}
          />
        </div>
      </div>

      {journey.nextNode ? (
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">
            {journey.currentNode.name}
          </span>
          {" → "}
          <span className="text-foreground font-medium">
            {journey.nextNode.name}
          </span>
          {" · "}
          {Math.round(journey.progressToNext * 100)}% of this leg
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          At <span className="text-foreground font-medium">{journey.currentNode.name}</span>
        </p>
      )}
    </header>
  );
}
