import Link from "next/link";

import { FeedMilestoneImage } from "@/features/feed/components/feed-milestone-image";
import { FeedRunSocial } from "@/features/feed/components/feed-run-social";
import { FEED_EVENT_TYPES } from "@/features/feed/types/feed-event";
import type { FeedEventDTO } from "@/lib/types/feed";

type FeedEventCardProps = {
  event: FeedEventDTO;
  currentUserId?: string | null;
  readOnly?: boolean;
};

function actorLabel(event: FeedEventDTO): string {
  return event.actor?.displayName ?? event.actor?.username ?? "Someone";
}

function runEditLink(runId: string) {
  return (
    <Link
      href={`/app/runs/${runId}/edit`}
      className="text-primary text-sm font-medium underline-offset-4 hover:underline"
    >
      Edit
    </Link>
  );
}

const SOCIAL_RUN_EVENT_TYPES = new Set<string>([
  FEED_EVENT_TYPES.RUN_CREATED,
  FEED_EVENT_TYPES.RUN_UPDATED,
]);

export function FeedEventCard({
  event,
  currentUserId,
  readOnly = false,
}: FeedEventCardProps) {
  const payload = event.payload;
  const runId = typeof payload.runId === "string" ? payload.runId : undefined;
  const showRunSocial = runId && SOCIAL_RUN_EVENT_TYPES.has(event.eventType);
  const canEditRun =
    Boolean(runId) &&
    SOCIAL_RUN_EVENT_TYPES.has(event.eventType) &&
    Boolean(currentUserId) &&
    event.actor?.id === currentUserId;
  const isMilestone = event.eventType === FEED_EVENT_TYPES.MILESTONE_REACHED;

  let title = "Activity";
  let description = "";

  switch (event.eventType) {
    case FEED_EVENT_TYPES.RUN_CREATED: {
      const distanceKm = Number(payload.distanceKm ?? payload.distance_km ?? 0);
      const durationMin = Number(payload.durationMin ?? payload.duration_min ?? 0);
      const pace = Number(payload.paceMinPerKm ?? 0);
      title = `${actorLabel(event)} logged a run`;
      description = `${distanceKm.toFixed(2)} km in ${durationMin} min (${pace.toFixed(2)} min/km)`;
      break;
    }
    case FEED_EVENT_TYPES.RUN_UPDATED:
      title = `${actorLabel(event)} updated a run`;
      description = `${Number(payload.distanceKm ?? payload.distance_km ?? 0).toFixed(2)} km · ${Number(payload.durationMin ?? payload.duration_min ?? 0)} min`;
      break;
    case FEED_EVENT_TYPES.RUN_DELETED:
      title = `${actorLabel(event)} deleted a run`;
      description = `${Number(payload.distanceKm ?? payload.distance_km ?? 0).toFixed(2)} km removed`;
      break;
    case FEED_EVENT_TYPES.MILESTONE_REACHED:
      title =
        typeof payload.title === "string"
          ? payload.title
          : "Milestone reached";
      description =
        typeof payload.message === "string"
          ? payload.message
          : typeof payload.nodeName === "string"
            ? `${payload.nodeName}${typeof payload.kmMarker === "number" ? ` · ${payload.kmMarker} km` : ""}`
            : "The fellowship advanced on the journey map";
      break;
    case FEED_EVENT_TYPES.BADGE_UNLOCKED:
      title = `${actorLabel(event)} unlocked a badge`;
      description = String(payload.badgeName ?? payload.badgeCode ?? "New badge");
      break;
    case FEED_EVENT_TYPES.CHALLENGE_COMPLETED:
      title = "Challenge completed";
      description = String(
        payload.challengeName ?? "The fellowship finished the challenge",
      );
      break;
    case FEED_EVENT_TYPES.AWARD_GRANTED:
      title = "Award granted";
      description = String(payload.awardName ?? payload.awardCode ?? "New award");
      break;
    case FEED_EVENT_TYPES.USER_JOINED_CHALLENGE:
      title = `${actorLabel(event)} joined the challenge`;
      break;
    default:
      title = event.eventType;
  }

  return (
    <article className="bg-card overflow-hidden rounded-xl border shadow-sm">
      {isMilestone ? <FeedMilestoneImage payload={payload} /> : null}
      <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{title}</p>
          {description ? (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {canEditRun && runId ? runEditLink(runId) : null}
          <time className="text-muted-foreground text-xs">
            {new Date(event.createdAt).toLocaleString()}
          </time>
        </div>
      </div>

      {showRunSocial ? (
        <FeedRunSocial
          runId={runId}
          challengeId={event.challengeId}
          reactions={payload.reactions}
          comments={payload.comments}
          readOnly={readOnly}
        />
      ) : null}
      </div>
    </article>
  );
}
