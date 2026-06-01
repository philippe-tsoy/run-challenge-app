"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getCurrentChallenge } from "@/features/challenges/lib/api";
import {
  listAdminUsers,
  removeUserFromChallenge,
  setAdminRole,
} from "@/features/admin/lib/api";

export function UsersPanel() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const { data: challenge } = useQuery({
    queryKey: ["challenge", "current"],
    queryFn: getCurrentChallenge,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: listAdminUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({
      userId,
      action,
    }: {
      userId: string;
      action: "grant" | "revoke";
    }) => setAdminRole(userId, action),
    onSuccess: async () => {
      setMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : "Action failed");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => {
      if (!challenge?.id) {
        throw new Error("No active challenge");
      }
      return removeUserFromChallenge(userId, challenge.id);
    },
    onSuccess: async () => {
      setMessage("User removed from current challenge");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : "Remove failed");
    },
  });

  const users = data?.users ?? [];

  return (
    <div className="space-y-4">
      {challenge ? (
        <p className="text-muted-foreground text-sm">
          Remove from challenge: <strong>{challenge.name}</strong>
        </p>
      ) : (
        <p className="text-destructive text-sm">
          No active challenge — removal is disabled.
        </p>
      )}
      {message ? <p className="text-sm">{message}</p> : null}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading users…</p>
      ) : error ? (
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Failed to load users"}
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-medium">
                  {user.displayName ?? user.username}
                  {user.isAdmin ? (
                    <span className="text-primary ml-2 text-xs font-normal">
                      Admin
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-sm">
                  @{user.username} · {user.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={roleMutation.isPending}
                  onClick={() =>
                    roleMutation.mutate({
                      userId: user.id,
                      action: user.isAdmin ? "revoke" : "grant",
                    })
                  }
                >
                  {user.isAdmin ? "Revoke admin" : "Make admin"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={!challenge?.id || removeMutation.isPending}
                  onClick={() => removeMutation.mutate(user.id)}
                >
                  Remove from challenge
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
