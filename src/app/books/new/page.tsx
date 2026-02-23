import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import AppShell from "@/components/AppShell";
import BookForm from "@/components/BookForm";
import { canManageBooks } from "@/lib/roles";

export default async function NewBookPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  // @ts-expect-error next-auth session typing augmentation handled in src/types
  const role = session.user?.role;
  if (!canManageBooks(role)) redirect("/unauthorized");

  return (
    <AppShell session={session}>
      <h1 className="text-2xl font-semibold">Add book</h1>
      <p className="mt-1 text-sm text-zinc-600">Create a new book record.</p>
      <div className="mt-6">
        <BookForm mode="create" />
      </div>
    </AppShell>
  );
}

