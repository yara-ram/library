import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function env(key: string) {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    ...(env("GITHUB_ID") && env("GITHUB_SECRET")
      ? [
          GithubProvider({
            clientId: env("GITHUB_ID")!,
            clientSecret: env("GITHUB_SECRET")!
          })
        ]
      : []),
    ...(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")
      ? [
          GoogleProvider({
            clientId: env("GOOGLE_CLIENT_ID")!,
            clientSecret: env("GOOGLE_CLIENT_SECRET")!
          })
        ]
      : [])
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error next-auth default types don't include role
        session.user.role = user.role;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      // First real user becomes ADMIN automatically (simple bootstrapping).
      const userCount = await prisma.user.count();
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN }
        });
      }
    }
  },
  pages: {
    signIn: "/signin"
  }
};

