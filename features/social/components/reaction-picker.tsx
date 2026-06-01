"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  removeReaction,
  upsertReaction,
  type ReactionsSummary,
} from "@/features/social/lib/api";
import {
  REACTION_TYPES,
  type ReactionType,
} from "@/lib/types/social";

const REACTION_LABELS: Record<ReactionType, string> = {
  like: "👍",
  fire: "🔥",
  water: "💧",
  ice: "❄️",
};

type ReactionPickerProps = {
  runId: string;
  reactions: ReactionsSummary;
  onChanged: () => void;
};

export function ReactionPicker({
  runId,
  reactions,
  onChanged,
}: ReactionPickerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(type: ReactionType) {
    setError(null);
    setIsSaving(true);

    try {
      if (reactions.userReaction === type) {
        await removeReaction(runId);
      } else {
        await upsertReaction(runId, type);
      }
      onChanged();
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : "Failed to update reaction",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {REACTION_TYPES.map((type) => {
          const isActive = reactions.userReaction === type;
          const count = reactions.counts[type];

          return (
            <Button
              key={type}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              disabled={isSaving}
              onClick={() => handleSelect(type)}
              aria-pressed={isActive}
            >
              {REACTION_LABELS[type]} {count > 0 ? count : ""}
            </Button>
          );
        })}
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
