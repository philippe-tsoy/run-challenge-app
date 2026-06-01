import { z } from "zod";

export const PACE_MIN_MIN_PER_KM = 2.0;
export const PACE_MAX_MIN_PER_KM = 20.0;
export const MAX_PHOTOS_PER_RUN = 3;

export function computePaceMinPerKm(
  distanceKm: number,
  durationMin: number,
): number {
  return Math.round((durationMin / distanceKm) * 100) / 100;
}

export function isPaceInRange(
  paceMinPerKm: number,
  adminOverride: boolean,
): boolean {
  if (adminOverride) {
    return true;
  }

  return (
    paceMinPerKm >= PACE_MIN_MIN_PER_KM && paceMinPerKm <= PACE_MAX_MIN_PER_KM
  );
}

const runBaseSchema = z.object({
  challengeId: z.string().uuid(),
  distanceKm: z.coerce.number().positive("Distance must be greater than 0"),
  durationMin: z.coerce
    .number()
    .int()
    .positive("Duration must be at least 1 minute"),
  notes: z.string().trim().max(2000).nullable().optional(),
  source: z.enum(["manual", "strava"]).default("manual"),
  adminOverride: z.boolean().default(false),
  ranAt: z.string().datetime().optional(),
});

export const createRunSchema = runBaseSchema;

export const updateRunSchema = runBaseSchema
  .partial()
  .omit({ challengeId: true })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listRunsQuerySchema = z.object({
  challengeId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateRunInput = z.infer<typeof createRunSchema>;
export type UpdateRunInput = z.infer<typeof updateRunSchema>;
export type ListRunsQuery = z.infer<typeof listRunsQuerySchema>;

export function validateRunMetrics(
  input: Pick<CreateRunInput, "distanceKm" | "durationMin" | "adminOverride">,
): { ok: true; paceMinPerKm: number } | { ok: false; message: string } {
  const paceMinPerKm = computePaceMinPerKm(
    input.distanceKm,
    input.durationMin,
  );

  if (!isPaceInRange(paceMinPerKm, input.adminOverride)) {
    return {
      ok: false,
      message: `Pace must be between ${PACE_MIN_MIN_PER_KM} and ${PACE_MAX_MIN_PER_KM} min/km`,
    };
  }

  return { ok: true, paceMinPerKm };
}
