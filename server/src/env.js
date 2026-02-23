import { z } from "zod";

const boolFromString = (value, defaultValue) => {
  if (value == null || value === "") return defaultValue;
  return value === "true" || value === "1";
};

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(3001),
  SESSION_SECRET: z.string().optional().default("dev-secret-change-me-please-change"),
  CLIENT_URL: z.string().optional().default("http://localhost:5173"),

  COOKIE_SECURE: z.string().optional(),
  COOKIE_SAMESITE: z.string().optional(),

  ADMIN_EMAILS: z.string().optional().default(""),

  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini")
});

export function getEnv() {
  const env = EnvSchema.parse(process.env);

  return {
    ...env,
    COOKIE_SECURE: boolFromString(env.COOKIE_SECURE, false),
    COOKIE_SAMESITE: env.COOKIE_SAMESITE || "lax",
    ADMIN_EMAILS: (env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  };
}
