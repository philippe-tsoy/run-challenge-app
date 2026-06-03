import { Suspense } from "react";

import { AdminSettingsLink } from "@/components/admin-settings-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { StravaSettings } from "@/features/strava/components/strava-settings";

export default function SettingsPage() {
  return (
    <main className="flex flex-col gap-6 pb-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Integrations and account preferences
        </p>
      </header>

      <section className="bg-card space-y-3 rounded-xl border p-4 shadow-sm">
        <div>
          <h2 className="font-medium">Appearance</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Light mode is the default. Your choice is saved on this device.
          </p>
        </div>
        <ThemeToggle />
      </section>

      <Suspense fallback={null}>
        <AdminSettingsLink />
      </Suspense>

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
