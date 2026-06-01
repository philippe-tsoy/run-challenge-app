"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RunSocialPanel } from "@/features/social/components/run-social-panel";
import { PhotoPicker } from "@/features/runs/components/photo-picker";
import { useDeleteRun, useRun, useUpdateRun } from "@/features/runs/hooks/use-runs";
import { deleteRunPhoto } from "@/features/runs/lib/api";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  updateRunSchema,
  type UpdateRunInput,
} from "@/lib/validators/run";

type RunEditFormProps = {
  runId: string;
};

export function RunEditForm({ runId }: RunEditFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: run, isLoading, error, refetch } = useRun(runId);
  const updateRunMutation = useUpdateRun(run?.challengeId ?? "", runId);
  const deleteRunMutation = useDeleteRun(run?.challengeId ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateRunInput>();

  const isOwner = session?.user?.id === run?.user.id;

  async function onSubmit(values: UpdateRunInput) {
    if (!run) {
      return;
    }

    setFormError(null);

    const parsed = updateRunSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof UpdateRunInput, { message: issue.message });
        }
      });
      return;
    }

    try {
      await updateRunMutation.mutateAsync(parsed.data);
      router.push(`/app/challenges/${run.challengeId}`);
      router.refresh();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update run",
      );
    }
  }

  async function handleDelete() {
    if (!run) {
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await deleteRunMutation.mutateAsync(runId);
      router.push(`/app/challenges/${run.challengeId}`);
      router.refresh();
    } catch (deleteError) {
      setFormError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete run",
      );
    }
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      await deleteRunPhoto(runId, photoId);
      await refetch();
    } catch (photoError) {
      setFormError(
        photoError instanceof Error
          ? photoError.message
          : "Failed to delete photo",
      );
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading run...</p>;
  }

  if (error || !run) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Run not found"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {!isOwner ? (
        <p className="text-muted-foreground text-sm">
          You can view and interact with this run, but only the owner can edit
          distance, notes, or photos.
        </p>
      ) : null}

      {isOwner ? (
      <form
        className="bg-card space-y-4 rounded-xl border p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Label htmlFor="distanceKm">Distance (km)</Label>
          <Input
            id="distanceKm"
            type="number"
            step="0.01"
            defaultValue={run.distanceKm}
            {...register("distanceKm", { valueAsNumber: true })}
          />
          {errors.distanceKm ? (
            <p className="text-destructive text-sm">
              {errors.distanceKm.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMin">Duration (minutes)</Label>
          <Input
            id="durationMin"
            type="number"
            defaultValue={run.durationMin}
            {...register("durationMin", { valueAsNumber: true })}
          />
          {errors.durationMin ? (
            <p className="text-destructive text-sm">
              {errors.durationMin.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" defaultValue={run.notes ?? ""} {...register("notes")} />
        </div>

        {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
      ) : null}

      {isOwner ? (
      <section className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
        <h2 className="font-medium">Photos</h2>

        {run.photos.length ? (
          <div className="grid grid-cols-3 gap-2">
            {run.photos.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-md border">
                <Image
                  src={photo.thumbnailUrl}
                  alt="Run photo"
                  width={photo.width ?? 200}
                  height={photo.height ?? 200}
                  className="aspect-square h-auto w-full object-cover"
                  unoptimized
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-8 min-h-8 px-2"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No photos yet.</p>
        )}

        <PhotoPicker
          runId={runId}
          existingCount={run.photos.length}
          onUploaded={() => refetch()}
        />
      </section>
      ) : null}

      <RunSocialPanel run={run} />

      {isOwner ? (
      <section className="bg-card rounded-xl border p-6 shadow-sm">
        <h2 className="text-destructive font-medium">Danger zone</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Deleting a run permanently removes it from the challenge.
        </p>
        <Button
          className="mt-4 w-full"
          variant="destructive"
          type="button"
          onClick={handleDelete}
          disabled={deleteRunMutation.isPending}
        >
          {confirmDelete
            ? deleteRunMutation.isPending
              ? "Deleting..."
              : "Confirm delete"
            : "Delete run"}
        </Button>
        {confirmDelete && !deleteRunMutation.isPending ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Tap again to confirm permanent deletion.
          </p>
        ) : null}
      </section>
      ) : null}
    </div>
  );
}
