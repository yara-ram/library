import express from "express";
import { z } from "zod";
import {
  checkinBook,
  checkoutBook,
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook
} from "../store/memory.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

const BookUpsertSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional().nullable(),
  publishedYear: z.number().int().optional().nullable(),
  genre: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([])
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const books = await listBooks({ q: q.trim() });
    res.json({ books });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const book = await getBookById(id);
    if (!book) return res.status(404).json({ error: "not_found" });
    res.json({ book });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin", "librarian"), async (req, res, next) => {
  try {
    const book = BookUpsertSchema.parse(req.body);
    const created = await createBook(book);
    res.status(201).json({ book: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole("admin", "librarian"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const book = BookUpsertSchema.parse(req.body);
    const updated = await updateBook(id, book);
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json({ book: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin", "librarian"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await deleteBook(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/checkout", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dueAtRaw = req.body?.dueAt ? new Date(req.body.dueAt) : null;
    const dueAt = dueAtRaw && !Number.isNaN(dueAtRaw.getTime()) ? dueAtRaw.toISOString() : null;

    const updated = await checkoutBook({ id, userId: req.user.id, dueAt });
    if (!updated) return res.status(409).json({ error: "not_available" });
    res.json({ book: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/checkin", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await getBookById(id);
    if (!current) return res.status(404).json({ error: "not_found" });

    const isBorrower =
      current.checked_out_by && Number(current.checked_out_by) === Number(req.user.id);
    const isStaff = ["admin", "librarian"].includes(req.user.role);
    if (!isBorrower && !isStaff) return res.status(403).json({ error: "forbidden" });

    const updated = await checkinBook({ id });
    if (!updated) return res.status(409).json({ error: "not_checked_out" });
    res.json({ book: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
