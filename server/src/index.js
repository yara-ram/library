import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "node:url";

import { getEnv } from "./env.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import userRoutes from "./routes/users.js";
import aiRoutes from "./routes/ai.js";
import { getUserById } from "./store/memory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = getEnv();

const app = express();
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

// Attach req.user from session (in-memory DB)
app.use(async (req, _res, next) => {
  try {
    const userId = req.session?.userId;
    req.user = userId ? await getUserById(userId) : null;
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// Serve built client (Render + production)
const publicDir = path.resolve(__dirname, "..", "public");
const indexHtml = path.join(publicDir, "index.html");
if (fs.existsSync(indexHtml)) {
  app.use(express.static(publicDir));
  app.get("*", (req, res) => {
    res.sendFile(indexHtml);
  });
}

app.use((err, req, res, _next) => {
  if (err?.name === "ZodError") return res.status(400).json({ error: "invalid_request", details: err.issues });
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on :${env.PORT}`);
});
