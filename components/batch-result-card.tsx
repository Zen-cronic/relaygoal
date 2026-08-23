"use client";

import type { BatchOutcome, BatchItemResult } from "@/src/core/batch";
import { VerificationChip } from "./verification-chip";

function humanize(key: string): string {
  const s = key.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function BatchResultCard({
  outcome,
  presetLabel,
}: {
  outcome: BatchOutcome;
  presetLabel: string;
}) {
  // Best pick first, then the rest in their original order.
  const ordered = [...outcome.items].sort((a, b) => {
    if (a.recipient.id === outcome.bestId) return -1;
    if (b.recipient.id === outcome.bestId) return 1;
    return 0;
  });

  return (
    <section aria-labelledby="batch-heading" className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">Compared {outcome.items.length} places</p>
        <h2 id="batch-heading" className="text-2xl">{presetLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ranked by: {outcome.rankedBy}</p>

        {outcome.bestId ? (
          <div role="note" className="mt-4 rounded-lg border-2 border-verified bg-verified/10 p-4">
            <div className="flex items-center gap-2">
              <VerificationChip status="verified" />
              <span className="font-semibold">Best pick</span>
            </div>
            <p className="mt-1 text-foreground">{outcome.reason}</p>
          </div>
        ) : (
          <div role="note" className="mt-4 rounded-lg border-2 border-caution bg-caution/10 p-4">
            <p className="font-semibold text-foreground">No confirmed winner.</p>
            <p className="mt-1 text-foreground">{outcome.reason}</p>
          </div>
        )}
      </div>

      <ol className="flex flex-col gap-4">
        {ordered.map((item) => (
          <PlaceCard key={item.recipient.id} item={item} isBest={item.recipient.id === outcome.bestId} />
        ))}
      </ol>
    </section>
  );
}

function PlaceCard({ item, isBest }: { item: BatchItemResult; isBest: boolean }) {
  return (
    <li
      className={`rounded-xl border bg-card p-4 ${isBest ? "border-verified ring-1 ring-verified" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg">{item.recipient.label}</h3>
          {isBest && <VerificationChip status="verified" className="text-xs" />}
        </div>
        <span className="font-mono text-sm text-muted-foreground">{item.recipient.phone}</span>
      </div>
      {item.outcome.unreachable && (
        <p className="mt-2 text-sm">
          <VerificationChip status="unreachable" />
        </p>
      )}
      <dl className="mt-3 divide-y divide-border">
        {item.outcome.fields.map((field) => (
          <div key={field.key} className="py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="font-semibold">{humanize(field.key)}</dt>
              <VerificationChip status={field.status === "verified" ? "verified" : "unverified"} />
            </div>
            <dd className="mt-0.5">
              {field.value === null || field.value === "" ? "No answer" : String(field.value)}
            </dd>
            {field.status === "verified" && field.quotes[0] && (
              <blockquote className="mt-1 border-l-2 border-verified pl-3 text-sm italic text-muted-foreground">
                &ldquo;{field.quotes[0].text}&rdquo;
              </blockquote>
            )}
            {field.status === "unverified" && field.reason && (
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Not confirmed:</span> {field.reason}.
              </p>
            )}
          </div>
        ))}
      </dl>
    </li>
  );
}
