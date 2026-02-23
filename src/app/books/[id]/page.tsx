import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import LinkButton from "@/components/LinkButton";
import InlineActionButtons from "@/components/InlineActionButtons";
import DeleteBookButton from "@/components/DeleteBookButton";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canManageBooks } from "@/lib/roles";
import AiMetadataPanel from "@/components/AiMetadataPanel";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) redirect("/signin");

  // @ts-expect-error next-auth session typing augmentation handled in src/types
  const role = session.user?.role;
  const actorId = (session.user as any).id as string;
  const canManage = canManageBooks(role);

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) notFound();

  const openLoan = await prisma.loan.findFirst({
    where: { bookId: book.id, checkedInAt: null },
    include: { borrower: true },
    orderBy: { checkedOutAt: "desc" }
  });

  return (
    <AppShell session={session}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{book.title}</h1>
            {book.status === "AVAILABLE" ? (
              <Badge variant="green">Available</Badge>
            ) : book.status === "BORROWED" ? (
              <Badge variant="yellow">Borrowed</Badge>
            ) : (
              <Badge>Archived</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">{book.author}</p>
          {book.description ? (
            <p className="mt-4 max-w-2xl text-sm text-zinc-700">{book.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canManage ? <LinkButton href={`/books/${book.id}/edit`}>Edit</LinkButton> : null}
          {canManage ? <DeleteBookButton bookId={book.id} /> : null}
          <InlineActionButtons
            bookId={book.id}
            bookStatus={book.status}
            openLoanBorrowerId={openLoan?.borrowerId ?? null}
            showArchiveActions={canManage}
            showCheckIn={role !== "MEMBER" || openLoan?.borrowerId === actorId}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Metadata</h2>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <dt className="col-span-1 text-zinc-500">ISBN</dt>
            <dd className="col-span-2 text-zinc-900">{book.isbn ?? "—"}</dd>
            <dt className="col-span-1 text-zinc-500">Publisher</dt>
            <dd className="col-span-2 text-zinc-900">{book.publisher ?? "—"}</dd>
            <dt className="col-span-1 text-zinc-500">Year</dt>
            <dd className="col-span-2 text-zinc-900">{book.year ?? "—"}</dd>
            <dt className="col-span-1 text-zinc-500">Language</dt>
            <dd className="col-span-2 text-zinc-900">{book.language ?? "—"}</dd>
            <dt className="col-span-1 text-zinc-500">Tags</dt>
            <dd className="col-span-2 text-zinc-900">{book.tags || "—"}</dd>
          </dl>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Loan status</h2>
          <div className="mt-4 text-sm text-zinc-700">
            {openLoan ? (
              <div className="space-y-1">
                <div>
                  Borrowed by{" "}
                  <span className="font-medium">
                    {openLoan.borrower.name ?? openLoan.borrower.email ?? "User"}
                  </span>
                </div>
                <div className="text-xs text-zinc-500">
                  Checked out: {openLoan.checkedOutAt.toLocaleString()}
                </div>
                {openLoan.dueAt ? (
                  <div className="text-xs text-zinc-500">
                    Due: {openLoan.dueAt.toLocaleString()}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>Not currently borrowed.</div>
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard" className="text-sm">
              Back to dashboard
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <AiMetadataPanel bookId={book.id} />
      </div>
    </AppShell>
  );
}
