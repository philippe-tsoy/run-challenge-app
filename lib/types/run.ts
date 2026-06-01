import type { ProfileDTO } from "@/lib/types/profile";
import { toProfileDTO, type ProfileRow } from "@/lib/types/profile";
import type {
  CommentDTO,
  ReactionsSummary,
} from "@/lib/types/social";
import { computePaceMinPerKm } from "@/lib/validators/run";

export type RunDTO = {
  id: string;
  distanceKm: number;
  durationMin: number;
  paceMinPerKm: number;
  notes: string | null;
  source: "manual" | "strava";
  isValid: boolean;
  createdAt: string;
  user: ProfileDTO;
};

export type RunPhotoDTO = {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
};

export type RunDetailDTO = RunDTO & {
  challengeId: string;
  photos: RunPhotoDTO[];
  reactionCount: number;
  comments: CommentDTO[];
  reactions: ReactionsSummary;
};

export type RunRow = {
  id: string;
  challenge_id: string;
  user_id: string;
  distance_km: number;
  duration_min: number;
  notes: string | null;
  source: "manual" | "strava";
  is_valid: boolean;
  created_at: string;
};

export type RunPhotoRow = {
  id: string;
  run_id: string;
  original_url: string;
  thumbnail_url: string;
  width: number | null;
  height: number | null;
};

type RunWithProfile = RunRow & {
  profiles: ProfileRow | ProfileRow[];
};

export function extractProfile(
  profiles: ProfileRow | ProfileRow[],
): ProfileRow {
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

export function toRunDTO(row: RunWithProfile): RunDTO {
  const profile = extractProfile(row.profiles);

  return {
    id: row.id,
    distanceKm: Number(row.distance_km),
    durationMin: row.duration_min,
    paceMinPerKm: computePaceMinPerKm(
      Number(row.distance_km),
      row.duration_min,
    ),
    notes: row.notes,
    source: row.source,
    isValid: row.is_valid,
    createdAt: row.created_at,
    user: toProfileDTO(profile),
  };
}

export function toRunPhotoDTO(row: RunPhotoRow): RunPhotoDTO {
  return {
    id: row.id,
    originalUrl: row.original_url,
    thumbnailUrl: row.thumbnail_url,
    width: row.width,
    height: row.height,
  };
}
