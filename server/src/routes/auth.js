import express from "express";
import passport from "passport";
import { getEnv } from "../env.js";

const router = express.Router();

router.get("/me", (req, res) => {
  res.json({ user: req.user || null });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session?.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure?provider=google" }),
  (req, res) => {
    const env = getEnv();
    res.redirect(env.CLIENT_URL);
  }
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/failure?provider=github" }),
  (req, res) => {
    const env = getEnv();
    res.redirect(env.CLIENT_URL);
  }
);

router.get("/failure", (req, res) => {
  const env = getEnv();
  const provider = typeof req.query.provider === "string" ? req.query.provider : "oauth";
  res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(provider)}`);
});

export default router;
