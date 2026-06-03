import Link from "next/link";

const links = [
  { href: "/app/admin", label: "Overview" },
  { href: "/app/admin/challenges/new", label: "New challenge" },
  { href: "/app/admin/invites", label: "Invites" },
  { href: "/app/admin/users", label: "Users" },
  { href: "/app/admin/runs", label: "Runs" },
  { href: "/app/admin/audit", label: "Audit log" },
] as const;

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-3 border-b pb-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-foreground text-sm font-medium underline-offset-4 hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
