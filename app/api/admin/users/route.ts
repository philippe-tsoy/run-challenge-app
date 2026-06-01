import { requireAdminUser } from "@/lib/auth/admin";
import { listAdminUsers } from "@/features/admin/lib/admin-users-service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const auth = await requireAdminUser(supabase);

  if ("response" in auth) {
    return auth.response;
  }

  const users = await listAdminUsers(supabase);
  return Response.json({ users });
}
