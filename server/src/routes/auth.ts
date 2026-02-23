import type { Router } from "express";
import passport from "passport";
import { env, cookieOptions } from "../env.js";
import { prisma } from "../prisma.js";
import { signSession } from "../auth/jwt.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

function absoluteClientUrl(path: string) {
  const base = env.CLIENT_URL.replace(/\/+$/, "");
  const next = path.startsWith("/") ? path : `/${path}`;
  return `${base}${next}`;
}

export function registerAuthRoutes(router: Router) {
  router.get("/auth/providers", (_req, res) => {
    res.json({
      github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    });
  });

  router.post("/auth/dev-login", async (req, res) => {
    const enabled =
      process.env.NODE_ENV !== "production" &&
      (env.DEV_LOGIN_ENABLED === undefined || env.DEV_LOGIN_ENABLED === "true" || env.DEV_LOGIN_ENABLED === "1");
    if (!enabled) return res.status(404).json({ error: "Not found" });

    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = signSession({ sub: user.id, role: user.role, email: user.email, name: user.name });
    res.cookie("session", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  });

  router.get("/auth/me", requireAuth, (req: AuthedRequest, res) => {
    res.json({ user: req.user });
  });

  router.post("/auth/logout", (_req, res) => {
    res.clearCookie("session", cookieOptions);
    res.json({ ok: true });
  });

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    router.get("/auth/github", passport.authenticate("github", { session: false }));
    router.get(
      "/auth/github/callback",
      passport.authenticate("github", { session: false, failureRedirect: absoluteClientUrl("/signin?error=sso") }),
      async (req, res) => {
        const userId = (req.user as any)?.userId as string | undefined;
        if (!userId) return res.redirect(absoluteClientUrl("/signin?error=sso"));

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.redirect(absoluteClientUrl("/signin?error=sso"));

        const token = signSession({ sub: user.id, role: user.role, email: user.email, name: user.name });
        res.cookie("session", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.redirect(absoluteClientUrl("/"));
      }
    );
  }

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    router.get("/auth/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));
    router.get(
      "/auth/google/callback",
      passport.authenticate("google", { session: false, failureRedirect: absoluteClientUrl("/signin?error=sso") }),
      async (req, res) => {
        const userId = (req.user as any)?.userId as string | undefined;
        if (!userId) return res.redirect(absoluteClientUrl("/signin?error=sso"));

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.redirect(absoluteClientUrl("/signin?error=sso"));

        const token = signSession({ sub: user.id, role: user.role, email: user.email, name: user.name });
        res.cookie("session", token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.redirect(absoluteClientUrl("/"));
      }
    );
  }
}
