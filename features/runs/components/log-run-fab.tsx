"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/lib/store/ui-store";

type LogRunFabProps = {
  challengeId: string;
};

export function LogRunFab({ challengeId }: LogRunFabProps) {
  const setActiveModal = useUiStore((state) => state.setActiveModal);

  if (!challengeId) {
    return null;
  }

  return (
    <Button
      className="fixed right-4 bottom-6 z-40 h-14 min-h-14 rounded-full px-5 shadow-lg"
      onClick={() => setActiveModal("quick-add-run")}
      aria-label="Log a run"
    >
      <Plus className="size-5" />
      Log run
    </Button>
  );
}
