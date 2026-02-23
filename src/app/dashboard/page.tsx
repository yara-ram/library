import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import LinkButton from "@/components/LinkButton";
import BookRowActions from "@/components/BookRowActions";
import { canManageBooks } from "@/lib/roles";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const session = await requireSession();
  if (!session) redirect("/signin");

  // @ts-expect-error next-auth session typing augmentation handled in src/types
  const role = session.user?.role;
  const actorId = (session.user as any).id as string;

  const q = (searchParams?.q ?? "").trim();
  const statusFilter = (searchParams?.status ?? "").trim();

  const books = await prisma.book.findMany({
    where: {
      ...(statusFilter
        ? { status: statusFilter as any }
        : { status: { not: "ARCHIVED" } }),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { author: { contains: q, mode: "insensitive" } },
              { isbn: { contains: q, mode: "insensitive" } },
              { tags: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: { updatedAt: "desc" },
    take: 200
  });

  const openLoans = await prisma.loan.findMany({
    where: { checkedInAt: null, bookId: { in: books.map((b) => b.id) } },
    include: { borrower: true }
  });
  const openLoanByBookId = new Map(openLoans.map((l) => [l.bookId, l]));

  return (
    <AppShell session={session}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Books</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Search, manage inventory, and check books in/out.
          </p>
        </div>
        {canManageBooks(role) ? <LinkButton href="/books/new">Add book</LinkButton> : null}
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, author, ISBN, tags…"
          className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-xl border bg-white px-3 py-2 text-sm"
        >
          <option value="">Active (default)</option>
          <option value="AVAILABLE">Available</option>
          <option value="BORROWED">Borrowed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-zinc-50">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <div className="grid grid-cols-12 gap-3 border-b bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Author</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {books.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            No books found.
          </div>
        ) : (
          <ul className="divide-y">
            {books.map((book) => {
              const openLoan = openLoanByBookId.get(book.id);
              return (
                <li
                  key={book.id}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-3"
                >
                  <div className="col-span-5">
                    <Link href={`/books/${book.id}`} className="font-medium text-zinc-900">
                      {book.title}
                    </Link>
                    {book.tags ? (
                      <div className="mt-1 text-xs text-zinc-500">
                        Tags: {book.tags}
                      </div>
                    ) : null}
                  </div>
                  <div className="col-span-3 text-sm text-zinc-700">{book.author}</div>
                  <div className="col-span-2">
                    {book.status === "AVAILABLE" ? (
                      <Badge variant="green">Available</Badge>
                    ) : book.status === "BORROWED" ? (
                      <div className="space-y-1">
                        <Badge variant={openLoan?.dueAt && openLoan.dueAt < new Date() ? "red" : "yellow"}>
                          {openLoan?.dueAt && openLoan.dueAt < new Date() ? "Overdue" : "Borrowed"}
                        </Badge>
                        {openLoan ? (
                          <div className="text-xs text-zinc-500">
                            By {openLoan.borrower.name ?? openLoan.borrower.email ?? "User"}
                          </div>
                        ) : null}
                        {openLoan?.dueAt ? (
                          <div className="text-xs text-zinc-500">
                            Due {openLoan.dueAt.toLocaleDateString()}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <Badge>Archived</Badge>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <BookRowActions
                      bookId={book.id}
                      bookStatus={book.status}
                      openLoanBorrowerId={openLoan?.borrowerId ?? null}
                      actorId={actorId}
                      actorRole={role ?? null}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
