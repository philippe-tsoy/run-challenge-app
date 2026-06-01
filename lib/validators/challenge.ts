import { z } from "zod";

export const challengeStatusSchema = z.enum(["active", "completed", "all"]);

export const createChallengeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    targetKm: z.coerce.number().positive("Target must be positive"),
    themeCode: z.string().trim().min(1).default("lotr"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateChallengeSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    targetKm: z.coerce.number().positive().optional(),
    isActive: z.boolean().optional(),
    config: z.record(z.unknown()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type ChallengeStatusFilter = z.infer<typeof challengeStatusSchema>;
