import Link from "next/link";
import { Settings } from "lucide-react";

import { ProfileMenu } from "@/components/profile-menu";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/social/components/notification-bell";

export function AppTopBar() {
  return (
    <header className="border-border/80 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 w-full shrink-0 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <ProfileMenu />
        <div className="flex items-center gap-0.5">
          <NotificationBell variant="icon" />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/settings" aria-label="Settings">
              <Settings className="size-5" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
