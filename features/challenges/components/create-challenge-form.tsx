"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createChallenge } from "@/features/challenges/lib/api";
import {
  createChallengeSchema,
  type CreateChallengeInput,
} from "@/lib/validators/challenge";

const defaultValues: CreateChallengeInput = {
  name: "",
  startDate: "",
  endDate: "",
  targetKm: 500,
  themeCode: "lotr",
};

export function CreateChallengeForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateChallengeInput>({
    defaultValues,
  });

  async function onSubmit(values: CreateChallengeInput) {
    setFormError(null);

    const parsed = createChallengeSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof CreateChallengeInput, {
            message: issue.message,
          });
        }
      });
      return;
    }

    try {
      const challenge = await createChallenge(parsed.data);
      router.push(`/app/challenges/${challenge.id}`);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create challenge",
      );
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create challenge</CardTitle>
        <CardDescription>
          Creates a new active challenge, deactivates the previous one, seeds
          journey nodes, and enrolls all users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate ? (
                <p className="text-destructive text-sm">
                  {errors.startDate.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate ? (
                <p className="text-destructive text-sm">
                  {errors.endDate.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetKm">Target km</Label>
            <Input
              id="targetKm"
              type="number"
              step="0.1"
              min="1"
              {...register("targetKm", { valueAsNumber: true })}
            />
            {errors.targetKm ? (
              <p className="text-destructive text-sm">
                {errors.targetKm.message}
              </p>
            ) : null}
          </div>

          <input type="hidden" {...register("themeCode")} value="lotr" />

          {formError ? (
            <p className="text-destructive text-sm">{formError}</p>
          ) : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create challenge"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
