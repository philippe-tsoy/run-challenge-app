import Link from "next/link";
import { Shield } from "lucide-react";

import { isUserAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function AdminSettingsLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const isAdmin = await isUserAdmin(supabase, user.id);
  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/app/admin"
      className="hover:bg-accent flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
    >
      <Shield className="text-muted-foreground size-5 shrink-0" aria-hidden />
      <div>
        <p>Admin</p>
        <p className="text-muted-foreground text-xs font-normal">
          Challenges, users, invites, and moderation
        </p>
      </div>
    </Link>
  );
}
