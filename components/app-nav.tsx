import Link from "next/link";

import { AdminNavLink } from "@/components/admin-nav-link";
import { NotificationBell } from "@/features/social/components/notification-bell";

const links = [
  { href: "/app", label: "Journey" },
  { href: "/app/feed", label: "Feed" },
  { href: "/app/leaderboards", label: "Leaderboards" },
  { href: "/app/badges", label: "Badges" },
  { href: "/app/challenges", label: "Challenges" },
  { href: "/app/settings", label: "Settings" },
] as const;

export function AppNav() {
  return (
    <nav className="flex items-center gap-4 border-b pb-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-foreground text-sm font-medium underline-offset-4 hover:underline"
        >
          {link.label}
        </Link>
      ))}
      <AdminNavLink />
      <NotificationBell />
    </nav>
  );
}
