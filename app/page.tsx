"use client";

import { useState } from "react";
import { A11yControls } from "@/components/a11y-controls";
import { GoalComposer, type CallRequest } from "@/components/goal-composer";
import { CallStatusTimeline, type CallStage } from "@/components/call-status-timeline";
import { VerifiedResultCard } from "@/components/verified-result-card";
import { TranscriptPanel } from "@/components/transcript-panel";
import { BatchResultCard } from "@/components/batch-result-card";
import type { VerifiedOutcome, TranscriptTurn } from "@/src/core/types";
import type { BatchOutcome } from "@/src/core/batch";

type Status = "idle" | CallStage;
type ResultKind = "single" | "batch";
type Caption = { speaker: string; text: string; offsetSeconds: number };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.getAttribute("data-motion") === "reduced" ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [kind, setKind] = useState<ResultKind>("single");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [outcome, setOutcome] = useState<VerifiedOutcome | null>(null);
  const [batch, setBatch] = useState<BatchOutcome | null>(null);
  const [meta, setMeta] = useState<{ phoneMasked: string; presetLabel: string }>({ phoneMasked: "", presetLabel: "" });
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = status === "dialing" || status === "oncall";

  function reset(k: ResultKind) {
    setError(null);
    setOutcome(null);
    setBatch(null);
    setCaptions([]);
    setHighlighted(null);
    setKind(k);
    setStatus("dialing");
  }

  async function handleCall(req: CallRequest) {
    const reduce = prefersReduced();
    try {
      if (req.mode === "batch") {
        reset("batch");
        await wait(reduce ? 0 : 700);
        setStatus("oncall");
        const res = await fetch("/api/batch", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ presetId: req.batchPresetId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "The calls could not be placed.");
        setMeta({ phoneMasked: "", presetLabel: data.presetLabel });
        await wait(reduce ? 0 : 1400);
        setBatch(data.outcome as BatchOutcome);
        setStatus("done");
        return;
      }

      reset("single");
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The call could not be placed.");
      setMeta({ phoneMasked: data.phoneMasked, presetLabel: data.presetLabel });
      await wait(reduce ? 0 : 700);
      setStatus("oncall");
      const turns = (data.outcome.transcript ?? []) as TranscriptTurn[];
      for (const t of turns) {
        setCaptions((prev) => [...prev, { speaker: t.speaker, text: t.text, offsetSeconds: t.offsetSeconds }]);
        await wait(reduce ? 0 : 850);
      }
      if (turns.length === 0) await wait(reduce ? 0 : 900);
      setOutcome(data.outcome as VerifiedOutcome);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  function cite(offset: number) {
    setHighlighted(null);
    requestAnimationFrame(() => setHighlighted(offset));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">
            Relay<span className="text-primary">Goal</span>
          </h1>
          <p className="mt-1 max-w-xl text-lg text-muted-foreground">
            The call, made for you — with proof. Type a goal; we make the whole call and hand back a
            verified answer grounded in exactly what was said.
          </p>
        </div>
        <A11yControls />
      </header>

      <main id="main" className="grid flex-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <GoalComposer onSubmit={handleCall} disabled={busy} />
          {error && (
            <p role="alert" className="rounded-lg border-2 border-destructive bg-destructive/10 p-3 text-foreground">
              {error}
            </p>
          )}
          <HowItWorks />
        </div>

        <div className="flex flex-col gap-6">
          {status === "idle" && <IdlePanel />}

          {busy && kind === "single" && (
            <CallStatusTimeline stage={status as CallStage} captions={captions} phoneMasked={meta.phoneMasked} />
          )}
          {busy && kind === "batch" && <BatchProgress label={meta.presetLabel} />}

          {status === "done" && kind === "single" && outcome && (
            <>
              <VerifiedResultCard
                outcome={outcome}
                phoneMasked={meta.phoneMasked}
                presetLabel={meta.presetLabel}
                onCiteQuote={cite}
              />
              <section aria-labelledby="transcript-heading" className="rounded-xl border border-border bg-card p-5">
                <h2 id="transcript-heading" className="mb-3 text-lg">Full transcript</h2>
                <TranscriptPanel turns={outcome.transcript} highlightedOffset={highlighted} />
              </section>
            </>
          )}

          {status === "done" && kind === "batch" && batch && (
            <BatchResultCard outcome={batch} presetLabel={meta.presetLabel} />
          )}
        </div>
      </main>

      <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Built on <span className="font-semibold text-foreground">CALL-E</span> goal-driven tasks with structured
          extraction. This demo runs on a mocked call path (no real numbers dialed); swap in the CALL-E SDK to go live.
          Every number shown is a reserved-fictional 555-01xx number.
        </p>
      </footer>
    </div>
  );
}

function BatchProgress({ label }: { label: string }) {
  return (
    <section aria-labelledby="batch-progress-heading" className="rounded-xl border border-border bg-card p-5">
      <h2 id="batch-progress-heading" className="text-lg">Calling several places for you…</h2>
      <p className="mt-1 text-muted-foreground" aria-live="polite">{label || "Placing the calls and comparing what each one says."}</p>
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
      </div>
    </section>
  );
}

function IdlePanel() {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card/50 p-6">
      <h2 className="text-lg">Your result will appear here</h2>
      <p className="mt-2 text-muted-foreground">
        Pick an errand and press <span className="font-semibold text-foreground">Make the call for me</span>, or switch
        to <span className="font-semibold text-foreground">Compare places</span> to call several at once. Every answer
        comes back backed by the exact quote it came from — or an honest &ldquo;not confirmed, call yourself&rdquo;.
      </p>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, t: "Type the goal", d: "Say what you need in plain language. No phone call for you." },
    { n: 2, t: "The agent calls", d: "It handles the conversation and any phone menus, and captions everything." },
    { n: 3, t: "You get proof", d: "Each answer is bound to the exact words that were said — or marked unverified." },
  ];
  return (
    <section aria-labelledby="how-heading" className="rounded-xl border border-border bg-card p-5">
      <h2 id="how-heading" className="mb-3 text-lg">How it works</h2>
      <ol className="flex flex-col gap-3">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {s.n}
            </span>
            <span>
              <span className="font-semibold">{s.t}.</span>{" "}
              <span className="text-muted-foreground">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
