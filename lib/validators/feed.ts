import { z } from "zod";

export const listFeedQuerySchema = z.object({
  challengeId: z.string().uuid(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListFeedQuery = z.infer<typeof listFeedQuerySchema>;
