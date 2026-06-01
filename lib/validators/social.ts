import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(1000),
});

export const upsertReactionSchema = z.object({
  type: z.enum(["like", "fire", "water", "ice"]),
});

export const markNotificationsReadSchema = z
  .object({
    ids: z.array(z.string().uuid()).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.all) || (data.ids && data.ids.length > 0), {
    message: "Provide ids or set all to true",
  });

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpsertReactionInput = z.infer<typeof upsertReactionSchema>;
