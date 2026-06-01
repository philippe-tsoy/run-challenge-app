"use client";

import { useQuery } from "@tanstack/react-query";

import { listAuditLog } from "@/features/admin/lib/api";

export function AuditLogPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: () => listAuditLog(50),
  });

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading audit log…</p>;
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load audit log"}
      </p>
    );
  }

  const entries = data?.entries ?? [];

  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">No audit entries yet.</p>;
  }

  return (
    <ul className="divide-y rounded-xl border text-sm">
      {entries.map((entry) => (
        <li key={entry.id} className="space-y-1 p-4">
          <p className="font-medium">
            {entry.action}{" "}
            <span className="text-muted-foreground font-normal">
              · {entry.entityType}
              {entry.entityId ? ` ${entry.entityId.slice(0, 8)}…` : ""}
            </span>
          </p>
          <p className="text-muted-foreground">
            {entry.actor
              ? `@${entry.actor.username}`
              : "Unknown actor"}{" "}
            · {new Date(entry.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
