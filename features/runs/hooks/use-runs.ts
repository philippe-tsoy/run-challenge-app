"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createRun,
  deleteRun,
  getRun,
  listRuns,
  updateRun,
} from "@/features/runs/lib/api";
import {
  invalidateRunRelatedQueries,
  runQueryKeys,
} from "@/features/runs/lib/query-keys";
import type { CreateRunInput, UpdateRunInput } from "@/lib/validators/run";
import type { RunDTO } from "@/lib/types/run";

export function useRuns(challengeId: string, userId?: string) {
  return useInfiniteQuery({
    queryKey: runQueryKeys.list(challengeId, userId),
    queryFn: ({ pageParam }) =>
      listRuns({
        challengeId,
        userId,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(challengeId),
  });
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: runQueryKeys.detail(runId),
    queryFn: () => getRun(runId),
    enabled: Boolean(runId),
  });
}

export function useCreateRun(challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRunInput) => createRun(input, { idempotency: true }),
    onMutate: async (input) => {
      const key = runQueryKeys.list(challengeId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData(key);

      const optimisticRun: RunDTO = {
        id: `optimistic-${Date.now()}`,
        distanceKm: input.distanceKm,
        durationMin: input.durationMin,
        paceMinPerKm:
          Math.round((input.durationMin / input.distanceKm) * 100) / 100,
        notes: input.notes ?? null,
        source: input.source ?? "manual",
        isValid: true,
        createdAt: new Date().toISOString(),
        user: {
          id: "optimistic",
          username: "you",
          displayName: "You",
          avatarUrl: null,
        },
      };

      queryClient.setQueryData(key, (old: unknown) => {
        if (!old || typeof old !== "object" || !("pages" in old)) {
          return old;
        }

        const data = old as {
          pages: { runs: RunDTO[]; nextCursor: string | null }[];
          pageParams: unknown[];
        };

        return {
          ...data,
          pages: data.pages.map((page, index) =>
            index === 0
              ? { ...page, runs: [optimisticRun, ...page.runs] }
              : page,
          ),
        };
      });

      return { previous, key };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => {
      invalidateRunRelatedQueries(queryClient, challengeId);
    },
  });
}

export function useUpdateRun(challengeId: string, runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRunInput) => updateRun(runId, input),
    onSuccess: () => {
      invalidateRunRelatedQueries(queryClient, challengeId);
      queryClient.invalidateQueries({ queryKey: runQueryKeys.detail(runId) });
    },
  });
}

export function useDeleteRun(challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => deleteRun(runId),
    onSuccess: () => {
      invalidateRunRelatedQueries(queryClient, challengeId);
    },
  });
}
