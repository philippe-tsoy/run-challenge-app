"use client";

import { useChallenges } from "@/features/challenges/hooks/use-challenges";
import type { ChallengeDTO } from "@/lib/types/challenge";

type ChallengeFeedFilterProps = {
  value: string;
  onChange: (challengeId: string) => void;
};

export function ChallengeFeedFilter({
  value,
  onChange,
}: ChallengeFeedFilterProps) {
  const { data, isLoading } = useChallenges("all");
  const challenges = data?.challenges ?? [];

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading challenges...</p>
    );
  }

  if (!challenges.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Join a challenge to see activity.
      </p>
    );
  }

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">Challenge</span>
      <select
        className="border-input bg-background h-11 min-h-11 w-full rounded-md border px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {challenges.map((challenge: ChallengeDTO) => (
          <option key={challenge.id} value={challenge.id}>
            {challenge.name}
            {challenge.isActive ? " (active)" : " (historical)"}
          </option>
        ))}
      </select>
    </label>
  );
}
