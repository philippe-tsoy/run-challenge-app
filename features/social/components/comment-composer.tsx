"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/features/social/lib/api";

type CommentComposerProps = {
  runId: string;
  onPosted: () => void;
  variant?: "default" | "inline";
  autoFocus?: boolean;
  onCancel?: () => void;
};

export function CommentComposer({
  runId,
  onPosted,
  variant = "default",
  autoFocus = false,
  onCancel,
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write a comment first");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment(runId, trimmed);
      setBody("");
      onPosted();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to post comment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (variant === "inline") {
    return (
      <form className="space-y-2" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add a comment..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            className="h-9 flex-1"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="shrink-0 px-2"
            disabled={isSubmitting || !body.trim()}
          >
            {isSubmitting ? "..." : "Post"}
          </Button>
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </form>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Textarea
        placeholder="Add a comment..."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={1000}
        autoFocus={autoFocus}
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post comment"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
