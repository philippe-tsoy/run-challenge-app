"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { forceMilestone } from "@/features/milestones/lib/api";
import { invalidateRunRelatedQueries } from "@/features/runs/lib/query-keys";
import type { JourneyNodeOption } from "@/lib/types/milestone";

type MilestoneAdminForceProps = {
  challengeId: string;
  journeyNodes: JourneyNodeOption[];
};

export function MilestoneAdminForce({
  challengeId,
  journeyNodes,
}: MilestoneAdminForceProps) {
  const queryClient = useQueryClient();
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleForce() {
    if (!selectedNodeId) {
      setError("Select a journey node");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const milestone = await forceMilestone({
        challengeId,
        journeyNodeId: selectedNodeId,
      });
      invalidateRunRelatedQueries(queryClient, challengeId);
      setSuccess(`Forced milestone: ${milestone.title}`);
    } catch (forceError) {
      setError(
        forceError instanceof Error
          ? forceError.message
          : "Failed to force milestone",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
      <div>
        <h2 className="font-medium">Admin — Force milestone</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Creates a milestone record (idempotent) and a feed event if needed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="journeyNode">Journey node</Label>
        <select
          id="journeyNode"
          className="border-input bg-background h-11 min-h-11 w-full rounded-md border px-3 text-sm"
          value={selectedNodeId}
          onChange={(event) => setSelectedNodeId(event.target.value)}
        >
          <option value="">Select a node…</option>
          {journeyNodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name} ({node.kmMarker} km)
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <Button onClick={handleForce} disabled={isSubmitting}>
        {isSubmitting ? "Forcing..." : "Force milestone"}
      </Button>
    </section>
  );
}
