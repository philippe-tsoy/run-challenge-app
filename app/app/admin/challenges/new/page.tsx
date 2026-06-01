import { CreateChallengeForm } from "@/features/challenges/components/create-challenge-form";

export default function NewChallengePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">New challenge</h2>
      <CreateChallengeForm />
    </div>
  );
}
