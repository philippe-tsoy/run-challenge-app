import type { ProfileDTO } from "@/lib/types/profile";
import { toProfileDTO, type ProfileRow } from "@/lib/types/profile";

export type ReactionType = "like" | "fire" | "water" | "ice";

export const REACTION_TYPES: ReactionType[] = [
  "like",
  "fire",
  "water",
  "ice",
];

export type CommentDTO = {
  id: string;
  body: string;
  createdAt: string;
  user: ProfileDTO;
};

export type ReactionDTO = {
  id: string;
  type: ReactionType;
  createdAt: string;
  user: ProfileDTO;
};

export type ReactionsSummary = {
  counts: Record<ReactionType, number>;
  userReaction: ReactionType | null;
};

export type NotificationDTO = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
};

type ProfileRelation = ProfileRow | ProfileRow[];

function extractProfile(profiles: ProfileRelation): ProfileRow {
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

export function toCommentDTO(row: {
  id: string;
  body: string;
  created_at: string;
  profiles: ProfileRelation;
}): CommentDTO {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    user: toProfileDTO(extractProfile(row.profiles)),
  };
}

export function toReactionDTO(row: {
  id: string;
  reaction_type: ReactionType;
  created_at: string;
  profiles: ProfileRelation;
}): ReactionDTO {
  return {
    id: row.id,
    type: row.reaction_type,
    createdAt: row.created_at,
    user: toProfileDTO(extractProfile(row.profiles)),
  };
}
