import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

import type { RunPhotoDTO } from "@/lib/types/run";
import { MAX_PHOTOS_PER_RUN } from "@/lib/validators/run";
import { getPhotoCount, getRunById } from "@/features/runs/lib/run-service";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

type UploadPhotoInput = {
  original: File;
  thumbnail: File;
  width: number;
  height: number;
};

export async function uploadRunPhotos(
  supabase: SupabaseClient,
  runId: string,
  userId: string,
  photos: UploadPhotoInput[],
): Promise<RunPhotoDTO[]> {
  const run = await getRunById(supabase, runId);
  if (!run) {
    throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }

  if (run.user_id !== userId) {
    throw Object.assign(new Error("FORBIDDEN"), { code: "FORBIDDEN" });
  }

  const existingCount = await getPhotoCount(supabase, runId);
  if (existingCount + photos.length > MAX_PHOTOS_PER_RUN) {
    throw Object.assign(new Error("MAX_PHOTOS_EXCEEDED"), {
      code: "MAX_PHOTOS_EXCEEDED",
    });
  }

  const uploaded: RunPhotoDTO[] = [];

  for (const photo of photos) {
    if (!ALLOWED_TYPES.has(photo.original.type)) {
      throw Object.assign(new Error("INVALID_FILE_TYPE"), {
        code: "INVALID_FILE_TYPE",
      });
    }

    const photoId = randomUUID();
    const originalPath = `${run.challenge_id}/${runId}/${photoId}-original.webp`;
    const thumbnailPath = `${run.challenge_id}/${runId}/${photoId}-thumb.webp`;

    const { error: originalError } = await supabase.storage
      .from("run-photos")
      .upload(originalPath, photo.original, {
        contentType: photo.original.type,
        upsert: false,
      });

    if (originalError) {
      throw originalError;
    }

    const { error: thumbError } = await supabase.storage
      .from("run-photos")
      .upload(thumbnailPath, photo.thumbnail, {
        contentType: photo.thumbnail.type,
        upsert: false,
      });

    if (thumbError) {
      await supabase.storage.from("run-photos").remove([originalPath]);
      throw thumbError;
    }

    uploaded.push({
      id: photoId,
      originalUrl: originalPath,
      thumbnailUrl: thumbnailPath,
      width: photo.width,
      height: photo.height,
    });
  }

  return uploaded;
}
