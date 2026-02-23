"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canManageBooks } from "@/lib/roles";
import { bookInputSchema } from "@/lib/validation";
import { BookStatus } from "@prisma/client";

function getRoleFromSession(session: any) {
  return session?.user?.role;
}

export async function createBook(formData: FormData) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const role = getRoleFromSession(session);
  if (!canManageBooks(role)) redirect("/unauthorized");

  const parsed = bookInputSchema.parse({
    title: formData.get("title"),
    author: formData.get("author"),
    isbn: formData.get("isbn"),
    publisher: formData.get("publisher"),
    year: formData.get("year"),
    language: formData.get("language"),
    tags: formData.get("tags"),
    description: formData.get("description")
  });

  const book = await prisma.book.create({
    data: {
      title: parsed.title,
      author: parsed.author,
      isbn: parsed.isbn || null,
      publisher: parsed.publisher || null,
      year: parsed.year,
      language: parsed.language || null,
      tags: parsed.tags || "",
      description: parsed.description || ""
    }
  });

  redirect(`/books/${book.id}`);
}

export async function updateBook(bookId: string, formData: FormData) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const role = getRoleFromSession(session);
  if (!canManageBooks(role)) redirect("/unauthorized");

  const parsed = bookInputSchema.parse({
    title: formData.get("title"),
    author: formData.get("author"),
    isbn: formData.get("isbn"),
    publisher: formData.get("publisher"),
    year: formData.get("year"),
    language: formData.get("language"),
    tags: formData.get("tags"),
    description: formData.get("description")
  });

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title: parsed.title,
      author: parsed.author,
      isbn: parsed.isbn || null,
      publisher: parsed.publisher || null,
      year: parsed.year,
      language: parsed.language || null,
      tags: parsed.tags || "",
      description: parsed.description || ""
    }
  });

  redirect(`/books/${bookId}`);
}

export async function deleteBook(bookId: string) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const role = getRoleFromSession(session);
  if (!canManageBooks(role)) redirect("/unauthorized");

  await prisma.book.delete({ where: { id: bookId } });
  redirect("/dashboard");
}

export async function archiveBook(bookId: string) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const role = getRoleFromSession(session);
  if (!canManageBooks(role)) redirect("/unauthorized");

  await prisma.book.update({
    where: { id: bookId },
    data: { status: BookStatus.ARCHIVED }
  });
}

export async function unarchiveBook(bookId: string) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const role = getRoleFromSession(session);
  if (!canManageBooks(role)) redirect("/unauthorized");

  await prisma.book.update({
    where: { id: bookId },
    data: { status: BookStatus.AVAILABLE }
  });
}

export async function checkOutBook(bookId: string) {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const borrowerId = (session.user as any).id as string;
  await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found");
    if (book.status !== BookStatus.AVAILABLE) throw new Error("Book not available");

    const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await tx.loan.create({ data: { bookId, borrowerId, dueAt } });
    await tx.book.update({ where: { id: bookId }, data: { status: BookStatus.BORROWED } });
  });
}

export async function checkInBook(bookId: string, openLoanBorrowerId: string | null) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const role = getRoleFromSession(session);
  const actorId = (session.user as any).id as string;

  await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found");
    if (book.status !== BookStatus.BORROWED) throw new Error("Book is not borrowed");

    const openLoan = await tx.loan.findFirst({
      where: { bookId, checkedInAt: null },
      orderBy: { checkedOutAt: "desc" }
    });
    if (!openLoan) throw new Error("No open loan found");

    // Members can only check in their own borrowed books.
    if (role === "MEMBER" && openLoan.borrowerId !== actorId) {
      throw new Error("Not allowed");
    }
    if (openLoanBorrowerId && openLoanBorrowerId !== openLoan.borrowerId) {
      // UI was stale; still proceed based on DB record.
    }

    await tx.loan.update({
      where: { id: openLoan.id },
      data: { checkedInAt: new Date() }
    });
    await tx.book.update({ where: { id: bookId }, data: { status: BookStatus.AVAILABLE } });
  });
}
