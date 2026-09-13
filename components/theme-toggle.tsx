"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getStoredTheme(): Theme {
  const saved = window.localStorage.getItem("nisha-theme");
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

export default function ThemeToggle() {
  // Match the server for hydration; the inline layout script already paints
  // the correct background before this client control becomes interactive.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    document.documentElement.dataset.theme = storedTheme;
    window.localStorage.setItem("nisha-theme", storedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("nisha-theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="eyebrow flex h-10 items-center gap-2 border border-line px-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
    >
      <span aria-hidden className="text-base leading-none">
        {theme === "dark" ? "☼" : "◐"}
      </span>
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}