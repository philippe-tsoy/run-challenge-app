import type { SupabaseClient } from "@supabase/supabase-js";

import {
  fetchMilestoneImageUrls,
  fetchRunCommentsBatch,
  fetchRunEnrichments,
  fetchRunReactionsSummaries,
  mapFeedEventRow,
  type FeedEventRow,
} from "@/features/feed/lib/mapper";
import { FEED_EVENT_TYPES } from "@/features/feed/types/feed-event";
import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import type { FeedEventDTO } from "@/lib/types/feed";
import type { ListFeedQuery } from "@/lib/validators/feed";

const FEED_SELECT =
  "id, challenge_id, event_type, entity_type, entity_id, payload, created_at, profiles(id, username, display_name, avatar_url)";

const RUN_EVENT_TYPES = new Set<string>([
  FEED_EVENT_TYPES.RUN_CREATED,
  FEED_EVENT_TYPES.RUN_UPDATED,
  FEED_EVENT_TYPES.RUN_DELETED,
]);

const SOCIAL_RUN_EVENT_TYPES = new Set<string>([
  FEED_EVENT_TYPES.RUN_CREATED,
  FEED_EVENT_TYPES.RUN_UPDATED,
]);

export async function listFeedEvents(
  supabase: SupabaseClient,
  userId: string,
  query: ListFeedQuery,
): Promise<{ events: FeedEventDTO[]; nextCursor: string | null }> {
  const isMember = await isChallengeMember(
    supabase,
    query.challengeId,
    userId,
  );

  if (!isMember) {
    throw Object.assign(new Error("NOT_CHALLENGE_MEMBER"), {
      code: "NOT_CHALLENGE_MEMBER",
    });
  }

  let request = supabase
    .from("feed_events")
    .select(FEED_SELECT)
    .eq("challenge_id", query.challengeId)
    .neq("event_type", FEED_EVENT_TYPES.REACTION_CREATED)
    .neq("event_type", FEED_EVENT_TYPES.COMMENT_CREATED)
    .order("created_at", { ascending: false })
    .limit(query.limit + 1);

  if (query.cursor) {
    request = request.lt("created_at", query.cursor);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FeedEventRow[];
  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;

  const runIds = page
    .filter(
      (row) =>
        row.entity_id &&
        row.entity_type === "run" &&
        RUN_EVENT_TYPES.has(row.event_type),
    )
    .map((row) => row.entity_id as string);

  const socialRunIds = page
    .filter(
      (row) =>
        row.entity_id &&
        row.entity_type === "run" &&
        SOCIAL_RUN_EVENT_TYPES.has(row.event_type),
    )
    .map((row) => row.entity_id as string);

  const milestoneNodeIds = page
    .filter(
      (row) =>
        row.entity_id &&
        row.entity_type === "journey_node" &&
        row.event_type === FEED_EVENT_TYPES.MILESTONE_REACHED,
    )
    .map((row) => row.entity_id as string);

  const [runEnrichments, reactionSummaries, commentsByRun, milestoneImages] =
    await Promise.all([
      fetchRunEnrichments(supabase, runIds),
      fetchRunReactionsSummaries(supabase, socialRunIds, userId),
      fetchRunCommentsBatch(supabase, socialRunIds),
      fetchMilestoneImageUrls(supabase, milestoneNodeIds),
    ]);

  const events = page.map((row) => {
    const runId =
      row.entity_type === "run" && row.entity_id ? row.entity_id : undefined;

    const event = mapFeedEventRow(
      row,
      runId ? runEnrichments.get(runId) : undefined,
    );

    if (runId && SOCIAL_RUN_EVENT_TYPES.has(row.event_type)) {
      event.payload.reactions = reactionSummaries.get(runId);
      event.payload.comments = commentsByRun.get(runId) ?? [];
    }

    if (
      row.event_type === FEED_EVENT_TYPES.MILESTONE_REACHED &&
      row.entity_id
    ) {
      const imageUrl = milestoneImages.get(row.entity_id);
      if (imageUrl) {
        event.payload.imageUrl = imageUrl;
      }
    }

    return event;
  });

  return {
    events,
    nextCursor: hasMore ? page[page.length - 1]?.created_at ?? null : null,
  };
}
