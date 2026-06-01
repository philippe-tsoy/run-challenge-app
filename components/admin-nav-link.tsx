import Link from "next/link";

import { isUserAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function AdminNavLink() {
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
      className="text-muted-foreground hover:text-foreground text-sm font-medium underline-offset-4 hover:underline"
    >
      Admin
    </Link>
  );
}
