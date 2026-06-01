import type {
  FeedActor,
  FeedEventType,
} from "@/features/feed/types/feed-event";

export type FeedEventDTO = {
  id: string;
  challengeId: string;
  eventType: FeedEventType;
  payload: Record<string, unknown>;
  actor: FeedActor | null;
  createdAt: string;
};
