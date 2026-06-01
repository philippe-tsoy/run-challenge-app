import type { SupabaseClient } from "@supabase/supabase-js";

import { isChallengeMember } from "@/features/challenges/lib/challenge-service";
import { isUserAdmin } from "@/lib/auth/admin";
import type {
  CommentDTO,
  NotificationDTO,
  ReactionDTO,
  ReactionType,
  ReactionsSummary,
} from "@/lib/types/social";
import {
  REACTION_TYPES,
  toCommentDTO,
  toReactionDTO,
} from "@/lib/types/social";
import type { CreateCommentInput } from "@/lib/validators/social";

const PROFILE_SELECT =
  "profiles(id, username, email, display_name, avatar_url)";

async function assertRunAccess(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
): Promise<{ challengeId: string; ownerId: string }> {
  const { data: run, error } = await supabase
    .from("runs")
    .select("challenge_id, user_id")
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!run) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  const isMember = await isChallengeMember(
    supabase,
    run.challenge_id,
    userId,
  );
  if (!isMember) {
    throw Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
  }

  return { challengeId: run.challenge_id, ownerId: run.user_id };
}

export async function listCommentsForRun(
  supabase: SupabaseClient,
  runId: string,
): Promise<CommentDTO[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(`id, body, created_at, ${PROFILE_SELECT}`)
    .eq("run_id", runId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toCommentDTO(row));
}

export async function getReactionsSummary(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
): Promise<ReactionsSummary> {
  const { data, error } = await supabase
    .from("reactions")
    .select("reaction_type, user_id")
    .eq("run_id", runId);

  if (error) {
    throw error;
  }

  const counts = Object.fromEntries(
    REACTION_TYPES.map((type) => [type, 0]),
  ) as Record<ReactionType, number>;

  let userReaction: ReactionType | null = null;

  for (const row of data ?? []) {
    const type = row.reaction_type as ReactionType;
    if (REACTION_TYPES.includes(type)) {
      counts[type] += 1;
    }
    if (row.user_id === userId) {
      userReaction = type;
    }
  }

  return { counts, userReaction };
}

export async function createComment(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
  input: CreateCommentInput,
): Promise<CommentDTO> {
  await assertRunAccess(supabase, runId, userId);

  const { data, error } = await supabase
    .from("comments")
    .insert({
      run_id: runId,
      user_id: userId,
      body: input.body,
    })
    .select(`id, body, created_at, ${PROFILE_SELECT}`)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create comment");
  }

  return toCommentDTO(data);
}

export async function deleteComment(
  supabase: SupabaseClient,
  commentId: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!comment) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  if (!isAdmin && comment.user_id !== userId) {
    throw Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    throw error;
  }
}

export async function upsertReaction(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
  type: ReactionType,
): Promise<ReactionDTO> {
  await assertRunAccess(supabase, runId, userId);

  const { data, error } = await supabase
    .from("reactions")
    .upsert(
      {
        run_id: runId,
        user_id: userId,
        reaction_type: type,
      },
      { onConflict: "run_id,user_id" },
    )
    .select(`id, reaction_type, created_at, ${PROFILE_SELECT}`)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to save reaction");
  }

  return toReactionDTO(data);
}

export async function deleteReaction(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
): Promise<void> {
  await assertRunAccess(supabase, runId, userId);

  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("run_id", runId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function listNotifications(
  supabase: SupabaseClient,
  userId: string,
  options: {
    unreadOnly?: boolean;
    cursor?: string;
    limit: number;
  },
): Promise<{
  notifications: NotificationDTO[];
  unreadCount: number;
  nextCursor: string | null;
}> {
  let query = supabase
    .from("notifications")
    .select("id, notification_type, payload, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(options.limit + 1);

  if (options.unreadOnly) {
    query = query.eq("is_read", false);
  }

  if (options.cursor) {
    query = query.lt("created_at", options.cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;

  const { count: unreadCount, error: countError } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (countError) {
    throw countError;
  }

  return {
    notifications: page.map((row) => ({
      id: row.id,
      type: row.notification_type,
      payload: (row.payload ?? {}) as Record<string, unknown>,
      isRead: row.is_read,
      createdAt: row.created_at,
    })),
    unreadCount: unreadCount ?? 0,
    nextCursor: hasMore ? page[page.length - 1]?.created_at ?? null : null,
  };
}

export async function markNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  options: { ids?: string[]; all?: boolean },
): Promise<void> {
  let query = supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId);

  if (!options.all && options.ids?.length) {
    query = query.in("id", options.ids);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function checkIsAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  return isUserAdmin(supabase, userId);
}
