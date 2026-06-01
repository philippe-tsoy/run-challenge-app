import { z } from "zod";

export const stravaImportSchema = z.object({
  challengeId: z.string().uuid(),
  since: z.string().datetime().optional(),
});

export type StravaImportInput = z.infer<typeof stravaImportSchema>;
