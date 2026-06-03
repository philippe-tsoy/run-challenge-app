"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/hooks/use-session";
import { deleteComment } from "@/features/social/lib/api";
import type { CommentDTO } from "@/lib/types/social";

type CommentListProps = {
  comments: CommentDTO[];
  onChanged: () => void;
  readOnly?: boolean;
};

export function CommentList({ comments, onChanged, readOnly = false }: CommentListProps) {
  const { data: session } = useSession();

  async function handleDelete(commentId: string) {
    await deleteComment(commentId);
    onChanged();
  }

  if (!comments.length) {
    return (
      <p className="text-muted-foreground text-sm">No comments yet. Be the first.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => {
        const canDelete = session?.user?.id === comment.user.id;

        return (
          <li key={comment.id} className="bg-muted/40 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">
                {comment.user.displayName ?? comment.user.username}
              </p>
              <time className="text-muted-foreground text-xs">
                {new Date(comment.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{comment.body}</p>
            {canDelete && !readOnly ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive mt-2 h-8 min-h-8 px-2"
                onClick={() => handleDelete(comment.id)}
              >
                Delete
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
