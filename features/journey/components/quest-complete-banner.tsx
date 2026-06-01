import type { JourneyDTO } from "@/lib/types/journey";

type QuestCompleteBannerProps = {
  journey: JourneyDTO;
};

export function QuestCompleteBanner({ journey }: QuestCompleteBannerProps) {
  if (!journey.questComplete) {
    return null;
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <p className="text-sm font-medium uppercase tracking-wide">
        {journey.completionTitle}
      </p>
      <p className="mt-2 text-sm">{journey.completionMessage}</p>
      {journey.extendedUnlocked ? (
        <p className="mt-2 text-xs opacity-80">
          Extended journey unlocked — keep logging runs until the challenge ends.
        </p>
      ) : null}
    </section>
  );
}
