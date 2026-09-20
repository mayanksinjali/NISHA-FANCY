"use client";

import { usePathname } from "next/navigation";

/**
 * Soft cross-fade between routes (Task 4). Keying on the pathname replays a
 * fast 200ms fade on every navigation (shop listing ⇄ product detail). Pulses
 * only; it's disabled under prefers-reduced-motion via `motion-reduce:`.
 */
export default function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className="animate-[page-fade-in_200ms_ease-out] motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}
