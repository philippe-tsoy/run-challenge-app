import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { BadgeGallery } from "@/features/badges/components/badge-gallery";
import { AdminChallengeLink } from "@/features/challenges/components/admin-challenge-link";
import { ChallengeSwitcher } from "@/features/challenges/components/challenge-switcher";
import { ProfileLatestRunCard } from "@/features/profile/components/profile-latest-run-card";
import { ProfileStatsCard } from "@/features/profile/components/profile-stats-card";
import { getProfileStats } from "@/features/profile/lib/profile-stats-service";
import { getSessionProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getSessionProfile(supabase);

  if (!profile) {
    redirect("/login");
  }

  const stats = await getProfileStats(supabase, user.id, profile);

  return (
    <main className="flex min-h-dvh flex-col gap-8 pb-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your stats, challenges, and badges
          </p>
        </div>
        <LogoutButton />
      </header>

      <ProfileStatsCard stats={stats} />

      <ProfileLatestRunCard run={stats.latestRun} />

      <section className="space-y-4">
        <div className="flex justify-end">
          <AdminChallengeLink />
        </div>

        <Suspense
          fallback={
            <p className="text-muted-foreground text-sm">Loading challenges...</p>
          }
        >
          <ChallengeSwitcher />
        </Suspense>
      </section>

      <section id="badges" className="space-y-4 border-t pt-8">
        <div>
          <h2 className="text-lg font-medium">Badges</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Global achievements that persist across challenges
          </p>
        </div>
        <BadgeGallery hideIntro />
      </section>
    </main>
  );
}
