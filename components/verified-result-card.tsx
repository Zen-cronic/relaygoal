"use client";

import type { VerifiedOutcome, VerifiedField } from "@/src/core/types";
import { VerificationChip, type ChipStatus } from "./verification-chip";

function humanize(key: string): string {
  const s = key.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function overallChip(outcome: VerifiedOutcome): ChipStatus {
  if (outcome.unreachable) return "unreachable";
  return outcome.overall; // "verified" | "partial" | "unverified"
}

export function VerifiedResultCard({
  outcome,
  phoneMasked,
  presetLabel,
  onCiteQuote,
}: {
  outcome: VerifiedOutcome;
  phoneMasked: string;
  presetLabel: string;
  onCiteQuote: (offsetSeconds: number) => void;
}) {
  return (
    <section
      aria-labelledby="result-heading"
      className="rounded-xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Result</p>
          <h2 id="result-heading" className="text-2xl">{presetLabel}</h2>
        </div>
        <VerificationChip status={overallChip(outcome)} />
      </header>

      {outcome.summary && (
        <p className="border-b border-border px-5 py-3 text-muted-foreground">{outcome.summary}</p>
      )}

      <dl className="divide-y divide-border">
        {outcome.fields.map((field) => (
          <FieldRow key={field.key} field={field} onCiteQuote={onCiteQuote} />
        ))}
      </dl>

      {outcome.overall !== "verified" && outcome.advice && (
        <div
          role="note"
          className="m-5 rounded-lg border-2 border-caution bg-caution/10 p-4"
        >
          <p className="font-semibold text-foreground">Don&apos;t rely on the unconfirmed parts.</p>
          <p className="mt-1 text-foreground">{outcome.advice}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            To be sure, call them yourself: <span className="font-mono">{phoneMasked}</span>
          </p>
        </div>
      )}
    </section>
  );
}

function FieldRow({
  field,
  onCiteQuote,
}: {
  field: VerifiedField;
  onCiteQuote: (offsetSeconds: number) => void;
}) {
  const value = field.value === null || field.value === undefined || field.value === ""
    ? "No answer"
    : String(field.value);

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <dt className="font-semibold">{humanize(field.key)}</dt>
        <VerificationChip status={field.status === "verified" ? "verified" : "unverified"} />
      </div>
      <dd className="mt-1 text-lg">{value}</dd>

      {field.status === "verified" && field.quotes.length > 0 && (
        <div className="mt-3 rounded-lg bg-muted/50 p-3">
          <p className="mb-1 text-sm font-medium text-muted-foreground">Proof — what they actually said:</p>
          <ul className="flex flex-col gap-2">
            {field.quotes.map((q) => (
              <li key={q.offsetSeconds} className="flex flex-col gap-1">
                <blockquote className="border-l-2 border-verified pl-3 italic">&ldquo;{q.text}&rdquo;</blockquote>
                <button
                  type="button"
                  onClick={() => onCiteQuote(q.offsetSeconds)}
                  className="self-start rounded-md px-2 py-1 text-sm font-semibold text-primary underline underline-offset-2 hover:bg-accent"
                >
                  Show in transcript →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {field.status === "unverified" && field.reason && (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Not confirmed:</span> {field.reason}.
        </p>
      )}
    </div>
  );
}
