import { z } from "zod";

export const listMilestonesQuerySchema = z.object({
  challengeId: z.string().uuid(),
});

export const forceMilestoneSchema = z.object({
  challengeId: z.string().uuid(),
  journeyNodeId: z.string().uuid(),
});

export type ForceMilestoneInput = z.infer<typeof forceMilestoneSchema>;
