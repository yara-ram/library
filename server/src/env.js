import { z } from "zod";

const boolFromString = (value, defaultValue) => {
  if (value == null || value === "") return defaultValue;
  return value === "true" || value === "1";
};

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(3001),
  SESSION_SECRET: z.string().min(16),
  CLIENT_URL: z.string().url(),

  DEV_LOGIN_ENABLED: z.string().optional(),
  COOKIE_SECURE: z.string().optional(),
  COOKIE_SAMESITE: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_CALLBACK_URL: z.string().optional().default(""),

  GITHUB_CLIENT_ID: z.string().optional().default(""),
  GITHUB_CLIENT_SECRET: z.string().optional().default(""),
  GITHUB_CALLBACK_URL: z.string().optional().default(""),

  ADMIN_EMAILS: z.string().optional().default(""),

  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini")
});

export function getEnv() {
  const env = EnvSchema.parse(process.env);

  return {
    ...env,
    DEV_LOGIN_ENABLED: boolFromString(env.DEV_LOGIN_ENABLED, false),
    COOKIE_SECURE: boolFromString(env.COOKIE_SECURE, false),
    COOKIE_SAMESITE: env.COOKIE_SAMESITE || "lax",
    ADMIN_EMAILS: (env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  };
}
