"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { STORE } from "@/lib/config";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Once per visit — sessionStorage clears when the tab closes, so the next visit gets one too. */
const SESSION_FLAG = "install-toast-shown";
/** How long the toast stays on screen before sliding away on its own. */
const AUTO_DISMISS_MS = 5500;

/**
 * Controlled PWA install prompt for the storefront.
 *
 * Chrome's own banner fires on its own schedule and nags returning visitors,
 * so this component captures `beforeinstallprompt` (which permanently
 * suppresses the native banner) and shows our own toast instead:
 *   - appears once per visit, ~5.5s, then slides away on its own
 *   - never comes back until the visitor leaves and visits again
 *   - "Install" hands off to the native one-tap confirmation
 */
export default function InstallToast() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const eventRef = useRef<BeforeInstallPromptEvent | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault(); // suppress Chrome's own banner for good
      const installEvent = e as BeforeInstallPromptEvent;
      eventRef.current = installEvent;

      // Show once per visit: skip if we already showed it this session.
      try {
        if (sessionStorage.getItem(SESSION_FLAG)) return;
        sessionStorage.setItem(SESSION_FLAG, "1");
      } catch {
        // Private mode with storage disabled — still show, just can't remember.
      }

      // Small delay so it doesn't fight the page load / header animation.
      const showTimer = window.setTimeout(() => {
        setEvent(installEvent);
        setMounted(true);
        requestAnimationFrame(() => setVisible(true));
      }, 1500);
      const hideTimer = window.setTimeout(() => dismiss(), 1500 + AUTO_DISMISS_MS);
      timers.current.push(showTimer, hideTimer);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      timers.current.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 350); // let the slide-out finish
  }

  async function install() {
    const installEvent = eventRef.current ?? event;
    dismiss();
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => {});
  }

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-label={`Install ${STORE.name}`}
      className={`fixed inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 transition-all duration-300 ease-out md:inset-x-auto md:right-5 md:bottom-5 md:w-80 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper/95 px-4 py-3 shadow-[0_10px_30px_rgba(23,23,23,0.14)] backdrop-blur">
        <Image
          src="/logo.jpeg"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">
            Install {STORE.name}
          </p>
          <p className="truncate text-[11px] text-ink-soft">
            One-tap shopping, right from your home screen
          </p>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-black"
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 p-1 text-ink-soft transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
