"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const VISIT_COUNT_KEY = "run-app-visit-count";
const DISMISS_KEY = "run-app-a2hs-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const visits = Number(localStorage.getItem(VISIT_COUNT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(visits));

    const dismissed = localStorage.getItem(DISMISS_KEY) === "true";

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      if (visits >= 2 && !dismissed) {
        setVisible(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  }

  if (!visible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="bg-card fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-40 max-w-xs rounded-xl border p-4 shadow-lg">
      <p className="font-medium">Install Run Challenge</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Add the app to your home screen for quick access on runs.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
        <Button size="sm" variant="outline" onClick={handleDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
