import type { SupabaseClient, User } from "@supabase/supabase-js";

import { forbiddenError, unauthorizedError } from "@/lib/api/errors";
import type { NextResponse } from "next/server";

export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []).some((row) => {
    const roles = row.roles as { code: string } | { code: string }[] | null;
    if (Array.isArray(roles)) {
      return roles.some((role) => role.code === "admin");
    }
    return roles?.code === "admin";
  });
}

type AuthSuccess = { user: User; supabase: SupabaseClient };
type AuthFailure = { response: NextResponse };

export async function requireAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<AuthSuccess | AuthFailure> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { response: unauthorizedError() };
  }

  return { user, supabase };
}

export async function requireAdminUser(
  supabase: SupabaseClient,
): Promise<AuthSuccess | AuthFailure> {
  const auth = await requireAuthenticatedUser(supabase);
  if ("response" in auth) {
    return auth;
  }

  const isAdmin = await isUserAdmin(supabase, auth.user.id);
  if (!isAdmin) {
    return { response: forbiddenError("Admin access required") };
  }

  return auth;
}
