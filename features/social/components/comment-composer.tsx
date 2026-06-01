"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/features/social/lib/api";

type CommentComposerProps = {
  runId: string;
  onPosted: () => void;
};

export function CommentComposer({ runId, onPosted }: CommentComposerProps) {
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

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Textarea
        placeholder="Add a comment..."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={1000}
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Post comment"}
      </Button>
    </form>
  );
}
