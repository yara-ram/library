import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import BookForm from "@/components/BookForm";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canManageBooks } from "@/lib/roles";

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) redirect("/signin");

  // @ts-expect-error next-auth session typing augmentation handled in src/types
  const role = session.user?.role;
  if (!canManageBooks(role)) redirect("/unauthorized");

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) notFound();

  return (
    <AppShell session={session}>
      <h1 className="text-2xl font-semibold">Edit book</h1>
      <p className="mt-1 text-sm text-zinc-600">Update book metadata.</p>
      <div className="mt-6">
        <BookForm mode="edit" book={book} />
      </div>
    </AppShell>
  );
}

