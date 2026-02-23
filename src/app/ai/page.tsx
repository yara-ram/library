import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AiCatalogAssistant from "@/components/AiCatalogAssistant";

export default async function AiPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const recentBooks = await prisma.book.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    take: 10
  });

  return (
    <AppShell session={session}>
      <h1 className="text-2xl font-semibold">AI</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Simple AI helpers to speed up cataloging.
      </p>
      <div className="mt-6">
        <AiCatalogAssistant books={recentBooks.map((b) => ({ id: b.id, title: b.title }))} />
      </div>
    </AppShell>
  );
}

