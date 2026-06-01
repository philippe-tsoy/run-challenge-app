"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { listFeed } from "@/features/feed/lib/api";

export function useFeed(challengeId: string) {
  return useInfiniteQuery({
    queryKey: ["feed", challengeId],
    queryFn: ({ pageParam }) =>
      listFeed({
        challengeId,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(challengeId),
  });
}
