"use client";

import { useMemo, useState, useTransition } from "react";

type AiResult = {
  summary: string;
  suggestedTags: string[];
  suggestedDescription?: string;
  model?: string;
  usedFallback?: boolean;
};

export default function AiMetadataPanel({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prettyTags = useMemo(() => (result?.suggestedTags ?? []).join(", "), [result]);

  const run = () =>
    startTransition(async () => {
      setError(null);
      setResult(null);
      const res = await fetch(`/api/ai/book-metadata?bookId=${encodeURIComponent(bookId)}`);
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      setResult((await res.json()) as AiResult);
    });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">AI suggestions</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Uses OpenAI if configured; otherwise uses a local fallback.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending ? "Generating…" : "Generate"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs font-medium text-zinc-500">Summary</div>
            <div className="mt-2 text-sm text-zinc-800 whitespace-pre-wrap">
              {result.summary}
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs font-medium text-zinc-500">Suggested tags</div>
            <div className="mt-2 text-sm text-zinc-800">{prettyTags || "—"}</div>
            {result.model ? (
              <div className="mt-3 text-xs text-zinc-500">Model: {result.model}</div>
            ) : null}
            {result.usedFallback ? (
              <div className="mt-1 text-xs text-zinc-500">Fallback: on</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

