"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ChallengeCard } from "@/features/challenges/components/challenge-card";
import { useChallenges } from "@/features/challenges/hooks/use-challenges";
import type { ChallengeStatusFilter } from "@/lib/validators/challenge";

const FILTERS: { value: ChallengeStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Historical" },
];

export function ChallengeSwitcher() {
  const searchParams = useSearchParams();
  const status =
    (searchParams.get("status") as ChallengeStatusFilter | null) ?? "all";
  const activeFilter = FILTERS.some((filter) => filter.value === status)
    ? status
    : "all";

  const { data, isLoading, error } = useChallenges(activeFilter);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Challenges</h2>
        <div className="flex gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={`/app/challenges?status=${filter.value}`}
              className={
                activeFilter === filter.value
                  ? "bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground rounded-full px-3 py-1 text-sm"
              }
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading challenges...</p>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Failed to load challenges"}
        </p>
      ) : null}

      {data?.challenges.length ? (
        <div className="space-y-3">
          {data.challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              href={`/app/challenges/${challenge.id}`}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <p className="text-muted-foreground text-sm">
            No challenges in this view yet.
          </p>
        )
      )}
    </section>
  );
}
