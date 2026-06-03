/**
 * =====================================================
 * RUN CHALLENGE PWA
 * FEED EVENT TYPES
 * =====================================================
 *
 * This file is the canonical contract between:
 *
 * - Database feed_events table
 * - API responses
 * - Feed UI
 * - Notifications
 * - Real-time updates
 *
 * Every feed event must be representable here.
 *
 * Database event_type values MUST match these ids.
 */

/* =====================================================
 * EVENT TYPES
 * ===================================================== */

export const FEED_EVENT_TYPES = {
  RUN_CREATED: "run_created",
  RUN_UPDATED: "run_updated",
  RUN_DELETED: "run_deleted",

  COMMENT_CREATED: "comment_created",

  REACTION_CREATED: "reaction_created",

  BADGE_UNLOCKED: "badge_unlocked",

  MILESTONE_REACHED: "milestone_reached",

  CHALLENGE_COMPLETED: "challenge_completed",

  AWARD_GRANTED: "award_granted",

  USER_JOINED_CHALLENGE: "user_joined_challenge",
} as const;

export type FeedEventType =
  (typeof FEED_EVENT_TYPES)[keyof typeof FEED_EVENT_TYPES];

/* =====================================================
 * ENTITY TYPES
 * ===================================================== */

export const FEED_ENTITY_TYPES = {
  RUN: "run",

  COMMENT: "comment",

  REACTION: "reaction",

  BADGE: "badge",

  JOURNEY_NODE: "journey_node",

  CHALLENGE: "challenge",

  AWARD: "award",

  USER: "user",
} as const;

export type FeedEntityType =
  (typeof FEED_ENTITY_TYPES)[keyof typeof FEED_ENTITY_TYPES];

/* =====================================================
 * COMMON TYPES
 * ===================================================== */

export interface FeedActor {
  id: string;

  username: string;

  displayName: string | null;

  avatarUrl: string | null;
}

export interface FeedChallenge {
  id: string;

  name: string;
}

export interface FeedBaseEvent {
  id: string;

  challengeId: string;

  eventType: FeedEventType;

  entityType: FeedEntityType;

  entityId: string | null;

  actor: FeedActor | null;

  createdAt: string;
}

/* =====================================================
 * RUN EVENTS
 * ===================================================== */

export interface RunCreatedPayload {
  runId: string;

  distanceKm: number;

  durationMin: number;

  paceMinPerKm: number;

  notes: string | null;

  photoCount: number;
}

export interface RunCreatedEvent
  extends FeedBaseEvent {
  eventType: "run_created";

  payload: RunCreatedPayload;
}

export interface RunUpdatedPayload {
  runId: string;

  distanceKm: number;

  durationMin: number;
}

export interface RunUpdatedEvent
  extends FeedBaseEvent {
  eventType: "run_updated";

  payload: RunUpdatedPayload;
}

/* =====================================================
 * COMMENT EVENTS
 * ===================================================== */

export interface CommentCreatedPayload {
  commentId: string;

  runId: string;

  commentPreview: string;
}

export interface CommentCreatedEvent
  extends FeedBaseEvent {
  eventType: "comment_created";

  payload: CommentCreatedPayload;
}

/* =====================================================
 * REACTION EVENTS
 * ===================================================== */

export type ReactionType =
  | "like"
  | "fire"
  | "water"
  | "ice";

export interface ReactionCreatedPayload {
  reactionType: ReactionType;

  runId: string;
}

export interface ReactionCreatedEvent
  extends FeedBaseEvent {
  eventType: "reaction_created";

  payload: ReactionCreatedPayload;
}

/* =====================================================
 * BADGE EVENTS
 * ===================================================== */

export interface BadgeUnlockedPayload {
  badgeId: string;

  badgeCode: string;

  badgeName: string;
}

export interface BadgeUnlockedEvent
  extends FeedBaseEvent {
  eventType: "badge_unlocked";

  payload: BadgeUnlockedPayload;
}

/* =====================================================
 * JOURNEY MILESTONE EVENTS
 * ===================================================== */

export interface MilestoneReachedPayload {
  nodeId: string;

  nodeName: string;

  kmMarker: number;

  title: string;

  message: string;

  imageUrl?: string;
}

export interface MilestoneReachedEvent
  extends FeedBaseEvent {
  eventType: "milestone_reached";

  payload: MilestoneReachedPayload;
}

/* =====================================================
 * CHALLENGE EVENTS
 * ===================================================== */

export interface ChallengeCompletedPayload {
  challengeId: string;

  challengeName: string;

  totalDistanceKm: number;

  participantCount: number;
}

export interface ChallengeCompletedEvent
  extends FeedBaseEvent {
  eventType: "challenge_completed";

  payload: ChallengeCompletedPayload;
}

/* =====================================================
 * AWARD EVENTS
 * ===================================================== */

export interface AwardGrantedPayload {
  awardCode: string;

  awardName: string;

  userId: string;
}

export interface AwardGrantedEvent
  extends FeedBaseEvent {
  eventType: "award_granted";

  payload: AwardGrantedPayload;
}

/* =====================================================
 * JOIN EVENTS
 * ===================================================== */

export interface UserJoinedChallengePayload {
  userId: string;

  username: string;
}

export interface UserJoinedChallengeEvent
  extends FeedBaseEvent {
  eventType: "user_joined_challenge";

  payload: UserJoinedChallengePayload;
}

/* =====================================================
 * UNION TYPE
 * ===================================================== */

export type FeedEvent =
  | RunCreatedEvent
  | RunUpdatedEvent
  | CommentCreatedEvent
  | ReactionCreatedEvent
  | BadgeUnlockedEvent
  | MilestoneReachedEvent
  | ChallengeCompletedEvent
  | AwardGrantedEvent
  | UserJoinedChallengeEvent;

/* =====================================================
 * FEED GROUPING
 * ===================================================== */

export type FeedGroup =
  | "today"
  | "yesterday"
  | "this_week"
  | "older";

/* =====================================================
 * UI HELPERS
 * ===================================================== */

export function isRunEvent(
  event: FeedEvent
): boolean {
  return (
    event.eventType === "run_created" ||
    event.eventType === "run_updated"
  );
}

export function isSocialEvent(
  event: FeedEvent
): boolean {
  return (
    event.eventType === "comment_created" ||
    event.eventType === "reaction_created"
  );
}

export function isAchievementEvent(
  event: FeedEvent
): boolean {
  return (
    event.eventType === "badge_unlocked" ||
    event.eventType === "milestone_reached" ||
    event.eventType === "award_granted"
  );
}

/* =====================================================
 * PRIORITY
 * =====================================================
 *
 * Used for:
 * - feed highlighting
 * - animations
 * - confetti
 * - pinning
 */

export const FEED_EVENT_PRIORITY = {
  run_created: 1,
  comment_created: 1,
  reaction_created: 1,

  run_updated: 2,

  badge_unlocked: 3,

  milestone_reached: 4,

  award_granted: 5,

  challenge_completed: 6,

  user_joined_challenge: 1,
} as const;

/* =====================================================
 * FUTURE
 * =====================================================
 *
 * Phase 2:
 *
 * strava_imported
 * challenge_invite_accepted
 * challenge_reopened
 * extended_journey_unlocked
 *
 */
