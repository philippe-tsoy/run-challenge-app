"use client";

import { Button } from "@/components/ui/button";
import { FeedEventCard } from "@/features/feed/components/feed-event-card";
import { useFeed } from "@/features/feed/hooks/use-feed";
import type { ChallengeDTO } from "@/lib/types/challenge";

type FeedListProps = {
  challengeId: string;
  challenge?: ChallengeDTO | null;
};

export function FeedList({ challengeId, challenge }: FeedListProps) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(challengeId);

  const events = data?.pages.flatMap((page) => page.events) ?? [];
  const isHistorical = challenge ? !challenge.isActive : false;

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading feed...</p>;
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load feed"}
      </p>
    );
  }

  if (!events.length) {
    return (
      <section className="bg-card rounded-xl border p-6 text-center shadow-sm">
        <p className="font-medium">No activity yet</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Log a run and it will show up here for the whole fellowship.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {isHistorical ? (
        <p className="text-muted-foreground text-sm">
          Historical challenge — feed is frozen; no new events after the
          challenge ended.
        </p>
      ) : null}

      {events.map((event) => (
        <FeedEventCard key={event.id} event={event} />
      ))}

      {hasNextPage ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
