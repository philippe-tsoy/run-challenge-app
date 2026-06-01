import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ChallengeCard } from "@/features/challenges/components/challenge-card";
import { ChallengeCloseButton } from "@/features/admin/components/challenge-close-button";
import { MilestoneAdminForce } from "@/features/milestones/components/milestone-admin-force";
import { listJourneyNodesForChallenge } from "@/features/milestones/lib/milestone-service";
import { RunList } from "@/features/runs/components/run-list";
import {
  getChallengeDetail,
  isChallengeMember,
} from "@/features/challenges/lib/challenge-service";
import { isUserAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

type ChallengeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({
  params,
}: ChallengeDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isMember = await isChallengeMember(supabase, id, user.id);
  if (!isMember) {
    redirect("/app");
  }

  const challenge = await getChallengeDetail(supabase, id);
  if (!challenge) {
    notFound();
  }

  const isAdmin = await isUserAdmin(supabase, user.id);
  const journeyNodes = isAdmin
    ? await listJourneyNodesForChallenge(supabase, id)
    : [];

  return (
    <main className="flex min-h-dvh flex-col gap-6 pb-6">
      <div>
        <Link
          href="/app"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          ← All challenges
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Challenge detail
        </h1>
      </div>

      <ChallengeCard challenge={challenge} />

      <section className="bg-card grid gap-4 rounded-xl border p-6 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-sm">Participants</p>
          <p className="text-lg font-medium">{challenge.participantCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Journey nodes</p>
          <p className="text-lg font-medium">{challenge.journeyNodeCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Team progress</p>
          <p className="text-lg font-medium">
            {challenge.progressPercent.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Theme</p>
          <p className="text-lg font-medium">
            {challenge.themeCode ?? "—"}
          </p>
        </div>
      </section>

      {isAdmin ? (
        <section className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-medium">Admin tools</h2>
          <ChallengeCloseButton
            challengeId={challenge.id}
            challengeName={challenge.name}
            isActive={challenge.isActive}
          />
          <MilestoneAdminForce
            challengeId={challenge.id}
            journeyNodes={journeyNodes}
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Runs</h2>
        <RunList challengeId={challenge.id} />
      </section>
    </main>
  );
}
