export function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "unauthenticated" });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (role && allowedRoles.includes(role)) return next();
    return res.status(403).json({ error: "forbidden" });
  };
}

