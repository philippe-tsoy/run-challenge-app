import { RunEditForm } from "@/features/runs/components/run-edit-form";

type RunEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunEditPage({ params }: RunEditPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Edit run</h1>
      </header>

      <RunEditForm runId={id} />
    </main>
  );
}
