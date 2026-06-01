import type { JourneyDTO } from "@/lib/types/journey";

type LeaderboardPreviewProps = {
  journey: JourneyDTO;
};

export function LeaderboardPreview({ journey }: LeaderboardPreviewProps) {
  if (!journey.leaderboardPreview.length) {
    return null;
  }

  return (
    <section className="bg-card space-y-3 rounded-xl border p-4 shadow-sm">
      <h2 className="font-medium">Leaderboard</h2>
      <ol className="space-y-2">
        {journey.leaderboardPreview.map((entry) => (
          <li
            key={entry.userId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground w-5 tabular-nums">
                {entry.rank}
              </span>
              <span className="font-medium">
                {entry.displayName ?? entry.username}
              </span>
            </span>
            <span className="text-muted-foreground tabular-nums">
              {entry.value.toFixed(1)} km
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
