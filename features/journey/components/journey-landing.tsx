"use client";

import Link from "next/link";

import { useCurrentChallenge } from "@/features/challenges/hooks/use-challenges";
import { JourneyLocationBackground } from "@/features/journey/components/journey-location-background";
import { JourneyMap } from "@/features/journey/components/journey-map";
import { JourneyProgressHeader } from "@/features/journey/components/journey-progress-header";
import { LeaderboardPreview } from "@/features/journey/components/leaderboard-preview";
import { PersonalStatsStrip } from "@/features/journey/components/personal-stats-strip";
import { QuestCompleteBanner } from "@/features/journey/components/quest-complete-banner";
import { useJourney } from "@/features/journey/hooks/use-journey";

export function JourneyLanding() {
  const { data: challenge, isLoading: challengeLoading } = useCurrentChallenge();
  const challengeId = challenge?.id ?? "";
  const {
    data: journey,
    isLoading: journeyLoading,
    error,
  } = useJourney(challengeId);

  if (challengeLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading your challenge...</p>
    );
  }

  if (!challenge) {
    return (
      <section className="bg-card space-y-3 rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Journey</h1>
        <p className="text-muted-foreground text-sm">
          No active challenge right now. Browse historical challenges or ask an
          admin to start one.
        </p>
        <Link
          href="/app/challenges"
          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        >
          View challenges
        </Link>
      </section>
    );
  }

  if (journeyLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading journey map...</p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load journey"}
      </p>
    );
  }

  if (!journey) {
    return (
      <p className="text-muted-foreground text-sm">Loading journey map...</p>
    );
  }

  return (
    <JourneyLocationBackground
      imageUrl={journey.currentNode.imageUrl}
      nodeName={journey.currentNode.name}
    >
      <section className="journey-main-panel flex flex-col gap-6">
          <JourneyProgressHeader journey={journey} />
          <QuestCompleteBanner journey={journey} />
          <JourneyMap
            nodes={journey.nodes}
            extendedNodes={journey.extendedNodes}
            showExtendedMarkers={journey.showExtendedMarkers}
            currentNodeId={journey.currentNode.id}
            nextNodeId={journey.nextNode?.id ?? null}
            progressToNext={journey.progressToNext}
            teamDistanceKm={journey.teamDistanceKm}
          />
          <PersonalStatsStrip journey={journey} />
          <LeaderboardPreview journey={journey} />
      </section>
    </JourneyLocationBackground>
  );
}
