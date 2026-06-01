import type { SupabaseClient } from "@supabase/supabase-js";

import {
  fetchRunEnrichments,
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

  const runEnrichments = await fetchRunEnrichments(supabase, runIds);

  const events = page.map((row) => {
    const runId =
      row.entity_type === "run" && row.entity_id ? row.entity_id : undefined;

    return mapFeedEventRow(row, runId ? runEnrichments.get(runId) : undefined);
  });

  return {
    events,
    nextCursor: hasMore ? page[page.length - 1]?.created_at ?? null : null,
  };
}
