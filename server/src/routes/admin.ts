import type { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const roleSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "MEMBER"])
});

export function registerAdminRoutes(router: Router) {
  router.get("/admin/users", requireAuth, requireRole(["ADMIN"]), async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ users });
  });

  router.patch("/admin/users/:id/role", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: parsed.data.role } });
    res.json({ user });
  });
}

