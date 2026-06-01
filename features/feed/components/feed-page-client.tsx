"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import { useChallenges } from "@/features/challenges/hooks/use-challenges";
import { ChallengeFeedFilter } from "@/features/feed/components/challenge-feed-filter";
import { FeedList } from "@/features/feed/components/feed-list";

export function FeedPageClient() {
  const searchParams = useSearchParams();
  const { data: currentChallenge } = useCurrentChallenge();
  const { data: allChallenges } = useChallenges("all");
  const [challengeId, setChallengeId] = useState("");

  useEffect(() => {
    const fromQuery = searchParams.get("challengeId");
    if (fromQuery) {
      setChallengeId(fromQuery);
      return;
    }

    if (currentChallenge?.id && !challengeId) {
      setChallengeId(currentChallenge.id);
    }
  }, [searchParams, currentChallenge?.id, challengeId]);

  const selectedChallenge =
    allChallenges?.challenges.find((challenge) => challenge.id === challengeId) ??
    currentChallenge;

  return (
    <div className="space-y-6">
      <ChallengeFeedFilter value={challengeId} onChange={setChallengeId} />

      {challengeId ? (
        <FeedList challengeId={challengeId} challenge={selectedChallenge} />
      ) : (
        <p className="text-muted-foreground text-sm">
          Select a challenge to view its feed.
        </p>
      )}
    </div>
  );
}
