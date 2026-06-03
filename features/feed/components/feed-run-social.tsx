"use client";

import { useQueryClient } from "@tanstack/react-query";

import { FeedRunComments } from "@/features/feed/components/feed-run-comments";
import { ReactionPicker } from "@/features/social/components/reaction-picker";
import { invalidateRunRelatedQueries } from "@/features/runs/lib/query-keys";
import {
  REACTION_TYPES,
  type CommentDTO,
  type ReactionType,
  type ReactionsSummary,
} from "@/lib/types/social";

function emptyReactionsSummary(): ReactionsSummary {
  return {
    counts: Object.fromEntries(
      REACTION_TYPES.map((type) => [type, 0]),
    ) as Record<ReactionType, number>,
    userReaction: null,
  };
}

function parseReactionsSummary(value: unknown): ReactionsSummary {
  if (!value || typeof value !== "object") {
    return emptyReactionsSummary();
  }

  const source = value as Record<string, unknown>;
  const countsSource = source.counts;

  if (!countsSource || typeof countsSource !== "object") {
    return emptyReactionsSummary();
  }

  const counts = Object.fromEntries(
    REACTION_TYPES.map((type) => {
      const count = Number((countsSource as Record<string, unknown>)[type]);
      return [type, Number.isFinite(count) && count >= 0 ? count : 0];
    }),
  ) as Record<ReactionType, number>;

  const userReaction = source.userReaction;
  const parsedUserReaction =
    typeof userReaction === "string" && REACTION_TYPES.includes(userReaction as ReactionType)
      ? (userReaction as ReactionType)
      : null;

  return { counts, userReaction: parsedUserReaction };
}

function parseComments(value: unknown): CommentDTO[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is CommentDTO =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as CommentDTO).id === "string" &&
      typeof (item as CommentDTO).body === "string",
  );
}

type FeedRunSocialProps = {
  runId: string;
  challengeId: string;
  reactions: unknown;
  comments: unknown;
  readOnly?: boolean;
};

export function FeedRunSocial({
  runId,
  challengeId,
  reactions,
  comments,
  readOnly = false,
}: FeedRunSocialProps) {
  const queryClient = useQueryClient();
  const reactionsSummary = parseReactionsSummary(reactions);
  const commentList = parseComments(comments);

  function refreshSocial() {
    invalidateRunRelatedQueries(queryClient, challengeId);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <ReactionPicker
        runId={runId}
        reactions={reactionsSummary}
        onChanged={refreshSocial}
        disabled={readOnly}
      />

      <FeedRunComments
        runId={runId}
        comments={commentList}
        onChanged={refreshSocial}
        readOnly={readOnly}
      />
    </div>
  );
}
