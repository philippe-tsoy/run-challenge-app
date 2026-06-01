import { AppNav } from "@/components/app-nav";
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
    <div className="mx-auto w-full max-w-2xl px-6 pt-6">
      <OfflineBanner />
      <OfflineSyncManager />
      <AppNav />
      <div className="pt-6">{children}</div>
      <AppRunShell />
      <MilestoneWatcher />
      <BadgeWatcher />
      <InstallPrompt />
    </div>
  );
}