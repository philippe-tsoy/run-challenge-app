"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CommentComposer } from "@/features/social/components/comment-composer";
import { useSession } from "@/features/auth/hooks/use-session";
import { deleteComment } from "@/features/social/lib/api";
import type { CommentDTO } from "@/lib/types/social";
import { cn } from "@/lib/utils";

function commentAuthor(comment: CommentDTO): string {
  return comment.user.displayName ?? comment.user.username;
}

type FeedCommentLineProps = {
  comment: CommentDTO;
  showDelete?: boolean;
  onDelete?: () => void;
};

function FeedCommentLine({ comment, showDelete, onDelete }: FeedCommentLineProps) {
  const { data: session } = useSession();
  const canDelete = showDelete && session?.user?.id === comment.user.id;

  return (
    <div className="group text-sm leading-snug">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{commentAuthor(comment)}</span>
        <time
          className="text-muted-foreground shrink-0 text-xs"
          dateTime={comment.createdAt}
        >
          {new Date(comment.createdAt).toLocaleString()}
        </time>
      </div>
      <p className="mt-0.5 whitespace-pre-wrap">{comment.body}</p>
      {canDelete ? (
        <button
          type="button"
          className="text-muted-foreground hover:text-destructive mt-0.5 text-xs"
          onClick={onDelete}
        >
          Delete
        </button>
      ) : null}
    </div>
  );
}

type FeedRunCommentsProps = {
  runId: string;
  comments: CommentDTO[];
  onChanged: () => void;
  readOnly?: boolean;
};

export function FeedRunComments({
  runId,
  comments,
  onChanged,
  readOnly = false,
}: FeedRunCommentsProps) {
  const [expanded, setExpanded] = useState(false);

  const commentCount = comments.length;
  const latestComment = commentCount > 0 ? comments[commentCount - 1] : null;
  const hiddenCount = Math.max(0, commentCount - 1);

  async function handleDelete(commentId: string) {
    await deleteComment(commentId);
    onChanged();
  }

  function expandComments() {
    setExpanded(true);
  }

  function collapseComments() {
    setExpanded(false);
  }

  function toggleComments() {
    setExpanded((open) => !open);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "text-foreground h-9 w-9 shrink-0",
            expanded && "bg-accent",
          )}
          aria-label={
            commentCount > 0
              ? `Comments (${commentCount})`
              : "Add a comment"
          }
          aria-expanded={expanded}
          disabled={readOnly && commentCount === 0}
          onClick={toggleComments}
        >
          <MessageCircle className="size-5" strokeWidth={1.75} />
        </Button>
        {commentCount > 0 ? (
          <span className="text-muted-foreground text-xs tabular-nums">
            {commentCount}
          </span>
        ) : null}
      </div>

      {commentCount > 0 ? (
        <div className="space-y-1.5">
          {!expanded && latestComment ? (
            <FeedCommentLine
              comment={latestComment}
              showDelete={!readOnly}
              onDelete={() => handleDelete(latestComment.id)}
            />
          ) : null}

          {expanded
            ? comments.map((comment) => (
                <FeedCommentLine
                  key={comment.id}
                  comment={comment}
                  showDelete={!readOnly}
                  onDelete={() => handleDelete(comment.id)}
                />
              ))
            : null}

          {hiddenCount > 0 && !expanded ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={expandComments}
            >
              View all {commentCount} comments
            </button>
          ) : null}

          {expanded && commentCount > 1 ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={collapseComments}
            >
              Hide comments
            </button>
          ) : null}
        </div>
      ) : null}

      {expanded && !readOnly ? (
        <CommentComposer
          runId={runId}
          variant="inline"
          autoFocus
          onPosted={() => {
            onChanged();
            expandComments();
          }}
          onCancel={collapseComments}
        />
      ) : null}
    </div>
  );
}
