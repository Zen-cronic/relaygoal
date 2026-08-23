"use client";

import { useEffect, useState } from "react";

type Prefs = {
  dark: boolean;
  hc: boolean;
  textsize: "normal" | "large" | "xlarge";
  motion: "normal" | "reduced";
};

const KEY = "relaygoal-a11y";
const DEFAULTS: Prefs = { dark: false, hc: false, textsize: "normal", motion: "normal" };

function apply(p: Prefs) {
  const el = document.documentElement;
  el.classList.toggle("dark", p.dark);
  el.classList.toggle("hc", p.hc);
  if (p.textsize === "normal") el.removeAttribute("data-textsize");
  else el.setAttribute("data-textsize", p.textsize);
  if (p.motion === "normal") el.removeAttribute("data-motion");
  else el.setAttribute("data-motion", "reduced");
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode / storage blocked — controls still work for this session */
  }
}

export function A11yControls() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  // Sync initial state from whatever the pre-paint init script already applied.
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
      setPrefs({ ...DEFAULTS, ...stored });
    } catch {
      /* ignore */
    }
  }, []);

  function update(patch: Partial<Prefs>) {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      apply(next);
      return next;
    });
  }

  const sizes: Prefs["textsize"][] = ["normal", "large", "xlarge"];

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Accessibility settings">
      <Toggle pressed={prefs.dark} onClick={() => update({ dark: !prefs.dark })}>
        {prefs.dark ? "Light" : "Dark"}
      </Toggle>
      <Toggle pressed={prefs.hc} onClick={() => update({ hc: !prefs.hc })}>
        High contrast
      </Toggle>
      <Toggle
        pressed={prefs.textsize !== "normal"}
        onClick={() => {
          const i = sizes.indexOf(prefs.textsize);
          const nextSize = sizes[(i + 1) % sizes.length]!;
          update({ textsize: nextSize });
        }}
      >
        Text size: {prefs.textsize}
      </Toggle>
      <Toggle pressed={prefs.motion === "reduced"} onClick={() => update({ motion: prefs.motion === "reduced" ? "normal" : "reduced" })}>
        Reduce motion
      </Toggle>
    </div>
  );
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
