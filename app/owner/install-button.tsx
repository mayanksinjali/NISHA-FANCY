"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Owner-only "Install app" button.
 *
 * The storefront's InstallToast captures `beforeinstallprompt` (which
 * permanently suppresses Chrome's native mini-infobar), so an owner who
 * browsed the shop first would never get an install affordance on /owner.
 * This captures the same event inside the owner area and offers a one-tap
 * install of the owner-scoped PWA defined by app/owner/manifest.ts
 * (start_url + scope "/owner"), so what gets installed is the admin panel
 * only — never the storefront.
 *
 * Renders nothing when the browser can't install (e.g. Safari) or once the
 * app is already running in standalone mode. That matches the storefront's
 * install handling, which also relies on `beforeinstallprompt`.
 */
export default function InstallButton({
  label = "Install app",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as the installed owner app → nothing to offer.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    function onPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !promptEvent) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice.catch(() => {});
    setPromptEvent(null);
  }

  return (
    <button type="button" onClick={install} className={className}>
      {label}
    </button>
  );
}
