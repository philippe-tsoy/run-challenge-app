"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listNotifications,
  markNotificationsRead,
} from "@/features/social/lib/api";

export function useNotifications(unreadOnly = false) {
  return useInfiniteQuery({
    queryKey: ["notifications", unreadOnly ? "unread" : "all"],
    queryFn: ({ pageParam }) =>
      listNotifications({ unreadOnly, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const result = await listNotifications({ unreadOnly: false });
      return result.unreadCount;
    },
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
