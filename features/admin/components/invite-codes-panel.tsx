"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInviteCode,
  listInviteCodes,
  updateInviteCode,
} from "@/features/admin/lib/api";

export function InviteCodesPanel() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "invites"],
    queryFn: listInviteCodes,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createInviteCode({
        code,
        description: description || undefined,
      }),
    onSuccess: async () => {
      setCode("");
      setDescription("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "invites"] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateInviteCode(id, { isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "invites"] });
    },
  });

  const invites = data?.invites ?? [];

  return (
    <div className="space-y-8">
      <section className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
        <h2 className="font-medium">Create invite code</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Code</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="FELLOWSHIP2026"
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-description">Description (optional)</Label>
            <Input
              id="invite-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Friends batch"
            />
          </div>
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button
          type="button"
          disabled={!code.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "Creating…" : "Create code"}
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Existing codes</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">No invite codes yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-mono font-medium">{invite.code}</p>
                  <p className="text-muted-foreground text-sm">
                    {invite.description ?? "No description"} · {invite.currentUses}
                    {invite.maxUses !== null ? ` / ${invite.maxUses}` : ""} uses
                    {invite.expiresAt
                      ? ` · expires ${new Date(invite.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={invite.isActive ? "outline" : "default"}
                  size="sm"
                  disabled={toggleMutation.isPending}
                  onClick={() =>
                    toggleMutation.mutate({
                      id: invite.id,
                      isActive: !invite.isActive,
                    })
                  }
                >
                  {invite.isActive ? "Deactivate" : "Activate"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
