import Link from "next/link";

import type { ChallengeDTO } from "@/lib/types/challenge";

type ChallengeCardProps = {
  challenge: ChallengeDTO;
  href?: string;
};

export function ChallengeCard({ challenge, href }: ChallengeCardProps) {
  const progress = Math.min(
    100,
    challenge.targetKm > 0
      ? Math.round((challenge.teamDistanceKm / challenge.targetKm) * 100)
      : 0,
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{challenge.name}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {challenge.startDate} → {challenge.endDate}
          </p>
        </div>
        {challenge.isActive ? (
          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
            Historical
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Team distance</span>
          <span>
            {challenge.teamDistanceKm.toFixed(1)} / {challenge.targetKm} km
          </span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-card hover:bg-accent/40 block rounded-xl border p-4 shadow-sm transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="bg-card rounded-xl border p-4 shadow-sm">{content}</article>
  );
}
