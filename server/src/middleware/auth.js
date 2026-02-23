export function requireAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: "unauthenticated" });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    return next();
  };
}
