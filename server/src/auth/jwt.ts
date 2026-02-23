import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type SessionClaims = {
  sub: string;
  role: "ADMIN" | "STAFF" | "MEMBER";
  email: string;
  name?: string | null;
};

export function signSession(claims: SessionClaims) {
  return jwt.sign(claims, env.SESSION_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string) {
  return jwt.verify(token, env.SESSION_SECRET) as SessionClaims;
}

