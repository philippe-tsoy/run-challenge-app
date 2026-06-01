"use client";

import { useState } from "react";

import { compressImageFile } from "@/features/runs/lib/compress-image";
import { uploadRunPhotos } from "@/features/runs/lib/api";
import { MAX_PHOTOS_PER_RUN } from "@/lib/validators/run";

type PhotoPickerProps = {
  runId: string;
  existingCount: number;
  onUploaded: () => void;
};

export function PhotoPicker({
  runId,
  existingCount,
  onUploaded,
}: PhotoPickerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const remaining = MAX_PHOTOS_PER_RUN - existingCount;

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (!files.length) {
      return;
    }

    if (files.length > remaining) {
      setError(`You can add ${remaining} more photo(s) (max ${MAX_PHOTOS_PER_RUN})`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const compressed = await Promise.all(
        files.map((file) => compressImageFile(file)),
      );

      await uploadRunPhotos(runId, compressed);
      onUploaded();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload photos",
      );
    } finally {
      setIsUploading(false);
    }
  }

  if (remaining <= 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Maximum {MAX_PHOTOS_PER_RUN} photos reached for this run.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-medium">
        {isUploading ? "Uploading..." : `Add photo (${remaining} left)`}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={remaining > 1}
          className="sr-only"
          disabled={isUploading}
          onChange={handleChange}
        />
      </label>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
