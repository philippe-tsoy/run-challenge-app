import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/app/admin/challenges/new",
    title: "New challenge",
    description: "Create a challenge, seed journey nodes, and enroll all users.",
  },
  {
    href: "/app/admin/invites",
    title: "Invite codes",
    description: "Generate and manage signup invite codes.",
  },
  {
    href: "/app/admin/users",
    title: "Users",
    description: "Grant admin roles and remove members from a challenge.",
  },
  {
    href: "/app/admin/runs",
    title: "Run moderation",
    description: "Invalidate, restore, or delete runs.",
  },
  {
    href: "/app/admin/audit",
    title: "Audit log",
    description: "Recent destructive admin actions.",
  },
] as const;

export default function AdminHubPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map((section) => (
        <Link key={section.href} href={section.href}>
          <Card className="hover:bg-muted/40 h-full transition-colors">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-primary text-sm font-medium">Open →</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
