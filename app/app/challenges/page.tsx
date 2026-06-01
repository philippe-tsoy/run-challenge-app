import Link from "next/link";
import { Suspense } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { AdminChallengeLink } from "@/features/challenges/components/admin-challenge-link";
import { ChallengeSwitcher } from "@/features/challenges/components/challenge-switcher";
import { getSessionProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);

  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/app"
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
          >
            ← Journey map
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Challenges
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Signed in as {profile?.displayName ?? profile?.username ?? "Runner"}
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">Switch or open a challenge</p>
        <AdminChallengeLink />
      </div>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Loading challenges...</p>
        }
      >
        <ChallengeSwitcher />
      </Suspense>
    </main>
  );
}
