"use client";

import { useBadgeCatalog } from "@/features/badges/hooks/use-badges";

export function BadgeGallery() {
  const { data, isLoading, error } = useBadgeCatalog();

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading badge collection...</p>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load badges"}
      </p>
    );
  }

  const badges = data?.badges ?? [];

  return (
    <section className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Badges are global and persist across challenges.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {badges.map((badge) => (
          <article
            key={badge.code}
            className={[
              "rounded-xl border p-4 shadow-sm",
              badge.unlocked ? "bg-card" : "bg-muted/30 opacity-70",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium">{badge.name}</h3>
              <span className="text-muted-foreground text-xs capitalize">
                {badge.rarity}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {badge.description}
            </p>
            <p className="text-muted-foreground mt-3 text-xs">
              {badge.unlocked
                ? `Unlocked ${new Date(badge.unlockedAt ?? "").toLocaleDateString()}`
                : "Locked"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
