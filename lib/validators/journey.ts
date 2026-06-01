import { z } from "zod";

export const getJourneyQuerySchema = z.object({
  challengeId: z.string().uuid(),
});

export type GetJourneyQuery = z.infer<typeof getJourneyQuerySchema>;
