"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/lib/api";
import { useSession } from "@/features/auth/hooks/use-session";

export function LogoutButton() {
  const router = useRouter();
  const { data } = useSession();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  if (!data?.user) {
    return null;
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
