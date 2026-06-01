import { z } from "zod";

export const createInviteSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Code must be at least 4 characters")
    .max(64)
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(500).optional(),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const updateInviteSchema = z
  .object({
    isActive: z.boolean().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    maxUses: z.coerce.number().int().positive().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const adminUserRoleSchema = z.object({
  action: z.enum(["grant", "revoke"]),
});

export const removeUserFromChallengeSchema = z.object({
  challengeId: z.string().uuid(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type UpdateInviteInput = z.infer<typeof updateInviteSchema>;
