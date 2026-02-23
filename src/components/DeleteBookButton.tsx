"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBook } from "@/lib/actions";

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const ok = confirm("Delete this book? This cannot be undone.");
        if (!ok) return;
        startTransition(async () => {
          await deleteBook(bookId);
          router.push("/dashboard");
          router.refresh();
        });
      }}
      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-100 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

