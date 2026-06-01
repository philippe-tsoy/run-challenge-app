import { type NextRequest } from "next/server";

import { requireAuthenticatedUser } from "@/lib/auth/admin";
import {
  businessRuleError,
  forbiddenError,
  notFoundError,
  validationError,
} from "@/lib/api/errors";
import { uploadRunPhotos } from "@/features/runs/lib/photo-upload";
import { insertRunPhotos } from "@/features/runs/lib/run-service";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: runId } = await context.params;
  const supabase = await createClient();
  const auth = await requireAuthenticatedUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const formData = await request.formData();
  const entries = [...formData.entries()].filter(
    ([key]) => key.startsWith("photo_") && !key.endsWith("_thumb"),
  );

  if (!entries.length) {
    return validationError("At least one photo is required");
  }

  const photos = [];

  for (const [key, value] of entries) {
    if (!(value instanceof File)) {
      continue;
    }

    const index = key.replace("photo_", "");
    const thumb = formData.get(`photo_${index}_thumb`);

    if (!(thumb instanceof File)) {
      return validationError(`Missing thumbnail for ${key}`);
    }

    const width = Number(formData.get(`photo_${index}_width`) ?? 0);
    const height = Number(formData.get(`photo_${index}_height`) ?? 0);

    photos.push({
      original: value,
      thumbnail: thumb,
      width: width || null,
      height: height || null,
    });
  }

  try {
    const uploaded = await uploadRunPhotos(
      supabase,
      runId,
      auth.user.id,
      photos.map((photo) => ({
        original: photo.original,
        thumbnail: photo.thumbnail,
        width: photo.width ?? 0,
        height: photo.height ?? 0,
      })),
    );

    const saved = await insertRunPhotos(supabase, runId, uploaded);

    return Response.json({ photos: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { code?: string }).code;
      if (code === "MAX_PHOTOS_EXCEEDED") {
        return businessRuleError("Maximum 3 photos per run");
      }
      if (code === "FORBIDDEN") {
        return forbiddenError("You can only add photos to your own runs");
      }
      if (code === "NOT_FOUND") {
        return notFoundError("Run not found");
      }
      if (code === "INVALID_FILE_TYPE") {
        return validationError("Only jpg, png, and webp images are allowed");
      }
    }

    throw error;
  }
}
