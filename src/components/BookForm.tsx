"use client";

import { useMemo } from "react";
import { createBook, updateBook } from "@/lib/actions";

export default function BookForm({
  mode,
  book
}: {
  mode: "create" | "edit";
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    publisher: string | null;
    year: number | null;
    language: string | null;
    tags: string;
    description: string;
  };
}) {
  const action = useMemo(() => {
    if (mode === "create") return createBook;
    if (!book) throw new Error("Book required for edit mode");
    return (formData: FormData) => updateBook(book.id, formData);
  }, [mode, book]);

  return (
    <form action={action} className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm font-medium">Title</div>
          <input
            name="title"
            defaultValue={book?.title ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="space-y-1">
          <div className="text-sm font-medium">Author</div>
          <input
            name="author"
            defaultValue={book?.author ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="space-y-1">
          <div className="text-sm font-medium">ISBN</div>
          <input
            name="isbn"
            defaultValue={book?.isbn ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <div className="text-sm font-medium">Publisher</div>
          <input
            name="publisher"
            defaultValue={book?.publisher ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <div className="text-sm font-medium">Year</div>
          <input
            name="year"
            defaultValue={book?.year ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            inputMode="numeric"
          />
        </label>
        <label className="space-y-1">
          <div className="text-sm font-medium">Language</div>
          <input
            name="language"
            defaultValue={book?.language ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            placeholder="e.g. English"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <div className="text-sm font-medium">Tags</div>
          <input
            name="tags"
            defaultValue={book?.tags ?? ""}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            placeholder="comma,separated,tags"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <div className="text-sm font-medium">Description</div>
          <textarea
            name="description"
            defaultValue={book?.description ?? ""}
            className="h-28 w-full rounded-xl border bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {mode === "create" ? "Create" : "Save"}
        </button>
      </div>
    </form>
  );
}

