"use client";

import { useQueryClient } from "@tanstack/react-query";

import { CommentComposer } from "@/features/social/components/comment-composer";
import { CommentList } from "@/features/social/components/comment-list";
import { ReactionPicker } from "@/features/social/components/reaction-picker";
import { runQueryKeys } from "@/features/runs/lib/query-keys";
import { invalidateRunRelatedQueries } from "@/features/runs/lib/query-keys";
import type { RunDetailDTO } from "@/lib/types/run";

type RunSocialPanelProps = {
  run: RunDetailDTO;
};

export function RunSocialPanel({ run }: RunSocialPanelProps) {
  const queryClient = useQueryClient();

  function refreshSocial() {
    queryClient.invalidateQueries({ queryKey: runQueryKeys.detail(run.id) });
    invalidateRunRelatedQueries(queryClient, run.challengeId);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <section className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
      <div>
        <h2 className="font-medium">Reactions</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          One reaction per person — tap again to remove.
        </p>
        <div className="mt-3">
          <ReactionPicker
            runId={run.id}
            reactions={run.reactions}
            onChanged={refreshSocial}
          />
        </div>
      </div>

      <div>
        <h2 className="font-medium">Comments</h2>
        <div className="mt-3 space-y-4">
          <CommentList comments={run.comments} onChanged={refreshSocial} />
          <CommentComposer runId={run.id} onPosted={refreshSocial} />
        </div>
      </div>
    </section>
  );
}
