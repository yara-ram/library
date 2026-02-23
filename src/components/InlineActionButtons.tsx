"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveBook, checkInBook, checkOutBook, unarchiveBook } from "@/lib/actions";

function SmallButton({
  children,
  onClick,
  disabled
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default function InlineActionButtons({
  bookId,
  bookStatus,
  openLoanBorrowerId,
  showArchiveActions = false,
  showCheckIn = true
}: {
  bookId: string;
  bookStatus: string;
  openLoanBorrowerId: string | null;
  showArchiveActions?: boolean;
  showCheckIn?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const doAction = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <>
      {bookStatus === "AVAILABLE" ? (
        <SmallButton disabled={isPending} onClick={() => doAction(() => checkOutBook(bookId))}>
          Check out
        </SmallButton>
      ) : null}
      {bookStatus === "BORROWED" && showCheckIn ? (
        <SmallButton
          disabled={isPending}
          onClick={() => doAction(() => checkInBook(bookId, openLoanBorrowerId))}
        >
          Check in
        </SmallButton>
      ) : null}
      {showArchiveActions ? (
        bookStatus !== "ARCHIVED" ? (
          <SmallButton disabled={isPending} onClick={() => doAction(() => archiveBook(bookId))}>
            Archive
          </SmallButton>
        ) : (
          <SmallButton disabled={isPending} onClick={() => doAction(() => unarchiveBook(bookId))}>
            Restore
          </SmallButton>
        )
      ) : null}
    </>
  );
}
