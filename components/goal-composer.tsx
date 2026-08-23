"use client";

import { useMemo, useState } from "react";
import { verticals, batchPresets } from "@/src/goals";

export type CallRequest =
  | { mode: "single"; verticalId: string; presetId: string; goal: string }
  | { mode: "batch"; batchPresetId: string };

type Mode = "single" | "batch";

export function GoalComposer({
  onSubmit,
  disabled,
}: {
  onSubmit: (req: CallRequest) => void;
  disabled: boolean;
}) {
  const [mode, setMode] = useState<Mode>("single");

  // Single-call state
  const [verticalId, setVerticalId] = useState<string>(verticals[0]!.id);
  const vertical = useMemo(() => verticals.find((v) => v.id === verticalId)!, [verticalId]);
  const [presetId, setPresetId] = useState(vertical.presets[0]!.id);
  const preset = useMemo(
    () => vertical.presets.find((p) => p.id === presetId) ?? vertical.presets[0]!,
    [vertical, presetId],
  );
  const [goal, setGoal] = useState(vertical.presets[0]!.goalText);

  // Batch state
  const [batchPresetId, setBatchPresetId] = useState(batchPresets[0]!.id);
  const batchPreset = useMemo(
    () => batchPresets.find((p) => p.id === batchPresetId) ?? batchPresets[0]!,
    [batchPresetId],
  );

  function switchVertical(id: string) {
    const v = verticals.find((x) => x.id === id)!;
    setVerticalId(id);
    setPresetId(v.presets[0]!.id);
    setGoal(v.presets[0]!.goalText);
  }

  function switchPreset(id: string) {
    setPresetId(id);
    const p = vertical.presets.find((x) => x.id === id);
    if (p) setGoal(p.goalText);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "batch") onSubmit({ mode: "batch", batchPresetId });
    else onSubmit({ mode: "single", verticalId, presetId, goal });
  }

  return (
    <form className="rounded-xl border border-border bg-card p-5" onSubmit={submit}>
      <div className="mb-4 inline-flex rounded-lg border border-border p-1" role="group" aria-label="Call one place or compare several">
        {(["single", "batch"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            {m === "single" ? "One call" : "Compare places"}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <>
          <div className="mb-4" role="group" aria-label="Choose what kind of call">
            <div className="inline-flex rounded-lg border border-border p-1">
              {verticals.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={v.id === verticalId}
                  onClick={() => switchVertical(v.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    v.id === verticalId ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{vertical.tagline}</p>
          </div>

          <div className="mb-4">
            <label htmlFor="preset" className="mb-1 block font-semibold">Pick an errand</label>
            <select
              id="preset"
              value={presetId}
              onChange={(e) => switchPreset(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            >
              {vertical.presets.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="goal" className="mb-1 block font-semibold">
              What should we ask? <span className="font-normal text-muted-foreground">(you can edit this)</span>
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll call <span className="font-semibold">{preset.label}</span> and report back exactly what they say.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="batch-preset" className="mb-1 block font-semibold">Compare across places</label>
            <select
              id="batch-preset"
              value={batchPresetId}
              onChange={(e) => setBatchPresetId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            >
              {batchPresets.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll call all {batchPreset.recipients.length} and rank them — but only recommend one whose answer we can actually verify:
            </p>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
              {batchPreset.recipients.map((r) => (
                <li key={r.id}>{r.label}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-lg bg-primary px-4 py-3 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? "Calling…" : mode === "batch" ? `Call all ${batchPreset.recipients.length} & compare` : "Make the call for me"}
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Demo runs on a mocked call — no real number is dialed.
      </p>
    </form>
  );
}
