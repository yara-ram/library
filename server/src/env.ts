import { z } from "zod";

const boolFromEnv = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
};

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(16),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  COOKIE_SECURE: z.string().optional(),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).optional(),

  DEV_LOGIN_ENABLED: z.string().optional()
});

const raw = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  COOKIE_SAMESITE: process.env.COOKIE_SAMESITE,
  DEV_LOGIN_ENABLED: process.env.DEV_LOGIN_ENABLED
};

export const env = envSchema.parse(raw);

export const cookieOptions = {
  httpOnly: true,
  secure: boolFromEnv(env.COOKIE_SECURE, process.env.NODE_ENV === "production"),
  sameSite:
    env.COOKIE_SAMESITE ??
    (process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const))
};
