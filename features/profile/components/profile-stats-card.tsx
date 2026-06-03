import type { ProfileStatsDTO } from "@/features/profile/lib/profile-stats-service";

type ProfileStatsCardProps = {
  stats: ProfileStatsDTO;
};

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  const name = stats.displayName ?? stats.username;
  const rankLabel =
    stats.currentChallenge?.rank != null
      ? `#${stats.currentChallenge.rank}`
      : "—";

  return (
    <section className="bg-card rounded-xl border p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">@{stats.username}</p>
      </div>

      {stats.currentChallenge ? (
        <p className="text-muted-foreground mt-3 text-sm">
          Active challenge:{" "}
          <span className="text-foreground font-medium">
            {stats.currentChallenge.name}
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          No active challenge right now.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatItem
          label="Distance"
          value={
            stats.currentChallenge
              ? `${stats.currentChallenge.distanceKm.toFixed(1)} km`
              : "—"
          }
        />
        <StatItem label="Rank" value={rankLabel} />
        <StatItem
          label="Runs logged"
          value={
            stats.currentChallenge
              ? String(stats.currentChallenge.runsLogged)
              : "—"
          }
        />
        <StatItem
          label="Challenges"
          value={String(stats.challengesJoined)}
        />
        <StatItem
          label="Badges"
          value={`${stats.badgesUnlocked} / ${stats.badgesTotal}`}
        />
      </div>
    </section>
  );
}
