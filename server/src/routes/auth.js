import express from "express";
import { getEnv } from "../env.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createLocalUser, getUserById, verifyLocalPassword } from "../store/memory.js";

const router = express.Router();

router.get("/me", (req, res) => {
  res.json({ user: req.user || null });
});

router.post("/signup", async (req, res, next) => {
  try {
    const env = getEnv();
    const { email, password, name } = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1).optional()
      })
      .parse(req.body);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createLocalUser({
      email,
      name: name || null,
      passwordHash,
      adminEmails: env.ADMIN_EMAILS
    });

    req.session.userId = user.id;
    res.status(201).json({ user });
  } catch (err) {
    if (String(err?.message) === "email_taken") return res.status(409).json({ error: "email_taken" });
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(req.body);

    const user = await verifyLocalPassword({
      email,
      password,
      compare: bcrypt.compare
    });

    if (!user) return res.status(401).json({ error: "invalid_credentials" });
    req.session.userId = user.id;
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  req.session?.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/session", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.json({ user: null });
  const user = await getUserById(userId);
  res.json({ user });
});

export default router;
