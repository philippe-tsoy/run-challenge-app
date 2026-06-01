"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { closeChallengeEarly } from "@/features/admin/lib/api";

type ChallengeCloseButtonProps = {
  challengeId: string;
  challengeName: string;
  isActive: boolean;
};

export function ChallengeCloseButton({
  challengeId,
  challengeName,
  isActive,
}: ChallengeCloseButtonProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => closeChallengeEarly(challengeId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["challenge"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Close failed");
    },
  });

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => {
          if (
            window.confirm(
              `Close "${challengeName}" early? It will be deactivated and the end date set to today.`,
            )
          ) {
            mutation.mutate();
          }
        }}
      >
        {mutation.isPending ? "Closing…" : "Close challenge early"}
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
