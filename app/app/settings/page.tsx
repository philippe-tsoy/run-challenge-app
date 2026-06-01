import Link from "next/link";
import { Suspense } from "react";

import { StravaSettings } from "@/features/strava/components/strava-settings";

export default function SettingsPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <header>
        <Link
          href="/app"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Journey map
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Integrations and account preferences
        </p>
      </header>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Loading settings...</p>
        }
      >
        <StravaSettings />
      </Suspense>
    </main>
  );
}
