"use client";

import { useMemo, useState, useTransition } from "react";

export default function AiCatalogAssistant({
  books
}: {
  books: Array<{ id: string; title: string }>;
}) {
  const [bookId, setBookId] = useState<string>(books[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [out, setOut] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTitle = useMemo(
    () => books.find((b) => b.id === bookId)?.title ?? "",
    [books, bookId]
  );

  const run = () =>
    startTransition(async () => {
      setError(null);
      setOut(null);
      const res = await fetch(`/api/ai/book-metadata?bookId=${encodeURIComponent(bookId)}`);
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      setOut(await res.json());
    });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Catalog helper</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Pick a book and generate suggested tags/summary.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={run}
            disabled={isPending || !bookId}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isPending ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {selectedTitle ? (
        <div className="mt-4 text-sm text-zinc-700">
          Selected: <span className="font-medium">{selectedTitle}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {out ? (
        <pre className="mt-4 overflow-auto rounded-xl border bg-zinc-50 p-4 text-xs text-zinc-800">
          {JSON.stringify(out, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}

