import type { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";

const bookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(1).optional(),
  publisher: z.string().min(1).optional(),
  publishedYear: z.number().int().min(0).max(3000).optional(),
  language: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  tags: z.string().min(1).optional()
});

const bookUpdateSchema = bookCreateSchema.partial();

export function registerBookRoutes(router: Router) {
  router.get("/books", requireAuth, async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const where = {
      ...(status ? { status: status as any } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { author: { contains: query, mode: "insensitive" as const } },
              { isbn: { contains: query, mode: "insensitive" as const } },
              { publisher: { contains: query, mode: "insensitive" as const } },
              { tags: { contains: query, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const books = await prisma.book.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        loans: { where: { checkedInAt: null }, take: 1, include: { borrower: true } }
      }
    });

    res.json({
      books: books.map((b) => ({
        ...b,
        activeLoan: b.loans[0]
          ? {
              id: b.loans[0].id,
              checkedOutAt: b.loans[0].checkedOutAt,
              borrower: { id: b.loans[0].borrower.id, email: b.loans[0].borrower.email, name: b.loans[0].borrower.name }
            }
          : null
      }))
    });
  });

  router.get("/books/:id", requireAuth, async (req, res) => {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: {
        loans: { orderBy: { checkedOutAt: "desc" }, take: 20, include: { borrower: true } }
      }
    });
    if (!book) return res.status(404).json({ error: "Book not found" });

    res.json({ book });
  });

  router.post("/books", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
    const parsed = bookCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });

    const book = await prisma.book.create({ data: parsed.data });
    res.status(201).json({ book });
  });

  router.put("/books/:id", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
    const parsed = bookUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });

    const book = await prisma.book.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ book });
  });

  router.delete("/books/:id", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
    await prisma.book.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  });

  router.post("/books/:id/checkout", requireAuth, async (req: AuthedRequest, res) => {
    const borrowerId =
      req.user?.role === "ADMIN" || req.user?.role === "STAFF" ? (req.body?.borrowerId as string | undefined) : undefined;
    const effectiveBorrowerId = borrowerId ?? req.user?.id;
    if (!effectiveBorrowerId) return res.status(401).json({ error: "Not authenticated" });

    const borrower = await prisma.user.findUnique({ where: { id: effectiveBorrowerId } });
    if (!borrower) return res.status(404).json({ error: "Borrower not found" });

    const book = await prisma.book.findUnique({ where: { id: req.params.id } });
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.status === "BORROWED") return res.status(409).json({ error: "Book is already borrowed" });

    const loan = await prisma.loan.create({
      data: { bookId: book.id, borrowerId: effectiveBorrowerId }
    });
    await prisma.book.update({ where: { id: book.id }, data: { status: "BORROWED" } });

    res.json({ ok: true, loanId: loan.id });
  });

  router.post("/books/:id/checkin", requireAuth, async (req: AuthedRequest, res) => {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: { loans: { where: { checkedInAt: null }, take: 1 } }
    });
    if (!book) return res.status(404).json({ error: "Book not found" });

    const activeLoan = book.loans[0];
    if (!activeLoan) return res.status(409).json({ error: "Book is not currently borrowed" });

    const isBorrower = activeLoan.borrowerId === req.user?.id;
    const canManage = req.user?.role === "ADMIN" || req.user?.role === "STAFF";
    if (!isBorrower && !canManage) return res.status(403).json({ error: "Not authorized to check this in" });

    await prisma.loan.update({ where: { id: activeLoan.id }, data: { checkedInAt: new Date() } });
    await prisma.book.update({ where: { id: book.id }, data: { status: "AVAILABLE" } });

    res.json({ ok: true });
  });
}
