"use client";

import { usePathname } from "next/navigation";

import { AppBottomNav } from "@/components/app-bottom-nav";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const showBottomNav = !pathname.startsWith("/app/admin");

  return (
    <>
      <div
        className={
          showBottomNav
            ? "pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]"
            : undefined
        }
      >
        {children}
      </div>
      {showBottomNav ? <AppBottomNav pathname={pathname} /> : null}
    </>
  );
}
