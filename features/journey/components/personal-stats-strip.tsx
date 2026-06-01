import type { JourneyDTO } from "@/lib/types/journey";

type PersonalStatsStripProps = {
  journey: JourneyDTO;
};

export function PersonalStatsStrip({ journey }: PersonalStatsStripProps) {
  const rankLabel =
    journey.personalStats.rank != null
      ? `#${journey.personalStats.rank}`
      : "—";

  return (
    <section className="bg-card grid grid-cols-2 gap-4 rounded-xl border p-4 shadow-sm">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Your distance
        </p>
        <p className="mt-1 text-lg font-semibold">
          {journey.personalStats.distanceKm.toFixed(1)} km
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Your rank
        </p>
        <p className="mt-1 text-lg font-semibold">{rankLabel}</p>
      </div>
    </section>
  );
}
