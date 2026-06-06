import Link from "next/link";

import {
  formatDurationMinSec,
  formatPaceMinPerKm,
} from "@/lib/format/run-metrics";
import type { RunDTO } from "@/lib/types/run";
import { computePaceMinPerKm } from "@/lib/validators/run";

type ProfileLatestRunCardProps = {
  run: RunDTO | null;
};

export function ProfileLatestRunCard({ run }: ProfileLatestRunCardProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">Latest run</h2>

      {run ? (
        <article className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                {run.distanceKm.toFixed(2)} km · {formatDurationMinSec(run.durationMin)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatPaceMinPerKm(
                  computePaceMinPerKm(run.distanceKm, run.durationMin),
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Link
                href={`/app/runs/${run.id}/edit`}
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
              >
                Edit
              </Link>
              <time
                className="text-muted-foreground text-xs"
                dateTime={run.createdAt}
              >
                {new Date(run.createdAt).toLocaleString()}
              </time>
            </div>
          </div>

          {run.notes ? (
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
              {run.notes}
            </p>
          ) : null}

          {!run.isValid ? (
            <span className="text-destructive mt-2 inline-block text-xs font-medium">
              Invalid
            </span>
          ) : null}
        </article>
      ) : (
        <p className="text-muted-foreground bg-card rounded-xl border p-4 text-sm shadow-sm">
          No runs logged yet. Use Log run from the journey page to add your first
          entry.
        </p>
      )}
    </section>
  );
}
