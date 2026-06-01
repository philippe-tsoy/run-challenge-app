import { redirect } from "next/navigation";

import { AdminNav } from "@/features/admin/components/admin-nav";
import { isUserAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isUserAdmin(supabase, user.id);
  if (!isAdmin) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-dvh flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Challenge lifecycle, users, invites, and moderation.
        </p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
