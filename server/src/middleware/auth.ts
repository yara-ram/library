import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma.js";
import { verifySession } from "../auth/jwt.js";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: "ADMIN" | "STAFF" | "MEMBER";
    name?: string | null;
  };
};

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const claims = verifySession(token);
    const user = await prisma.user.findUnique({ where: { id: claims.sub } });
    if (!user) return res.status(401).json({ error: "Invalid session" });

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
}

export function requireRole(allowed: Array<"ADMIN" | "STAFF" | "MEMBER">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Not authenticated" });
    if (!allowed.includes(role)) return res.status(403).json({ error: "Not authorized" });
    next();
  };
}

