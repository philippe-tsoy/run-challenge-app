import Link from "next/link";

import { RunEditForm } from "@/features/runs/components/run-edit-form";

type RunEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunEditPage({ params }: RunEditPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <div>
        <Link
          href="/app"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit run</h1>
      </div>

      <RunEditForm runId={id} />
    </main>
  );
}
