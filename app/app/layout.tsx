import { AppShell } from "@/components/app-shell";
import { AppTopBar } from "@/components/app-top-bar";
import { BadgeWatcher } from "@/features/badges/components/badge-watcher";
import { InstallPrompt } from "@/features/offline/components/install-prompt";
import { OfflineBanner } from "@/features/offline/components/offline-banner";
import { OfflineSyncManager } from "@/features/offline/components/offline-sync-manager";
import { MilestoneWatcher } from "@/features/milestones/components/milestone-watcher";
import { AppRunShell } from "@/features/runs/components/app-run-shell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <OfflineBanner />
      <OfflineSyncManager />
      <AppTopBar />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-x-hidden px-4 pt-4">
        <AppShell>{children}</AppShell>
      </div>
      <AppRunShell />
      <MilestoneWatcher />
      <BadgeWatcher />
      <InstallPrompt />
    </div>
  );
}
