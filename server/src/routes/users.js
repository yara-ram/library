import express from "express";
import { z } from "zod";
import { listUsers, setUserRole } from "../store/memory.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const users = await listUsers();
    const staffUsers = users.filter((user) => user.role === "admin" || user.role === "librarian");
    const toLogRow = (user) => ({ id: user.id, email: user.email, role: user.role });
    console.log("Users:", users.map(toLogRow));
    console.log("Staff:", staffUsers.map(toLogRow));
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/role", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role } = z
      .object({ role: z.enum(["admin", "librarian", "member"]) })
      .parse(req.body);
    const user = await setUserRole({ id, role });
    if (!user) return res.status(404).json({ error: "not_found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
