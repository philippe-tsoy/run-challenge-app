"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifyPendingRunsUpdated } from "@/features/offline/hooks/use-pending-runs";
import { useCreateRun } from "@/features/runs/hooks/use-runs";
import { enqueuePendingRun } from "@/lib/offline/queue";
import { isOnline } from "@/lib/offline/sync";
import { useUiStore } from "@/lib/store/ui-store";
import { createRunSchema, type CreateRunInput } from "@/lib/validators/run";

type QuickAddRunModalProps = {
  challengeId: string;
};

export function QuickAddRunModal({ challengeId }: QuickAddRunModalProps) {
  const activeModal = useUiStore((state) => state.activeModal);
  const setActiveModal = useUiStore((state) => state.setActiveModal);
  const [formError, setFormError] = useState<string | null>(null);
  const createRunMutation = useCreateRun(challengeId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateRunInput>({
    defaultValues: {
      challengeId,
      distanceKm: 5,
      durationMin: 30,
      source: "manual",
      adminOverride: false,
    },
  });

  const isOpen = activeModal === "quick-add-run";

  function close() {
    setActiveModal(null);
    reset();
    setFormError(null);
  }

  async function onSubmit(values: CreateRunInput) {
    setFormError(null);

    const parsed = createRunSchema.safeParse({ ...values, challengeId });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof CreateRunInput, { message: issue.message });
        }
      });
      return;
    }

    try {
      if (!isOnline()) {
        const clientOperationId = crypto.randomUUID();
        await enqueuePendingRun({
          clientOperationId,
          challengeId: parsed.data.challengeId,
          distanceKm: parsed.data.distanceKm,
          durationMin: parsed.data.durationMin,
          notes: parsed.data.notes ?? null,
          queuedAt: new Date().toISOString(),
        });
        notifyPendingRunsUpdated();
        close();
        return;
      }

      await createRunMutation.mutateAsync(parsed.data);
      close();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to log run",
      );
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="bg-card w-full max-w-md rounded-xl border p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-run-title"
      >
        <h2 id="quick-add-run-title" className="text-lg font-semibold">
          Log a run
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Distance and duration are enough — add notes or photos when editing.
        </p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="distanceKm">Distance (km)</Label>
            <Input
              id="distanceKm"
              type="number"
              step="0.01"
              min="0.01"
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
              min="1"
              step="1"
              {...register("durationMin", { valueAsNumber: true })}
            />
            {errors.durationMin ? (
              <p className="text-destructive text-sm">
                {errors.durationMin.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="text-destructive text-sm">{formError}</p>
          ) : null}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="button"
              variant="outline"
              onClick={close}
            >
              Cancel
            </Button>
            <Button className="flex-1" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : typeof navigator !== "undefined" && !navigator.onLine
                  ? "Queue run"
                  : "Save run"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
