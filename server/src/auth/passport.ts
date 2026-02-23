import passport from "passport";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { env } from "../env.js";
import { prisma } from "../prisma.js";

type OAuthDone = (err: any, user?: { userId: string }) => void;

async function upsertOAuthUser(input: {
  provider: "github" | "google";
  providerAccountId: string;
  email: string;
  name?: string | null;
}) {
  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: input.provider, providerAccountId: input.providerAccountId } },
    include: { user: true }
  });

  if (existingAccount) {
    const updated = await prisma.user.update({
      where: { id: existingAccount.userId },
      data: { email: input.email, name: input.name ?? existingAccount.user.name }
    });
    return updated;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  const user =
    existingUser ??
    (await prisma.user.create({
      data: { email: input.email, name: input.name ?? null }
    }));

  await prisma.oAuthAccount.create({
    data: {
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      userId: user.id
    }
  });

  return user;
}

export function configurePassport() {
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: "/auth/github/callback",
          scope: ["user:email"]
        },
        async (_accessToken: string, _refreshToken: string, profile: GitHubProfile, done: OAuthDone) => {
          try {
            const primaryEmail =
              profile.emails?.find((e) => e.verified) ??
              profile.emails?.[0] ??
              (profile as any)._json?.email;

            if (!primaryEmail?.value) {
              return done(new Error("GitHub did not return an email for this account."));
            }

            const user = await upsertOAuthUser({
              provider: "github",
              providerAccountId: profile.id,
              email: primaryEmail.value,
              name: profile.displayName ?? profile.username ?? null
            });

            done(null, { userId: user.id });
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/auth/google/callback"
        },
        async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: OAuthDone) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("Google did not return an email for this account."));

            const user = await upsertOAuthUser({
              provider: "google",
              providerAccountId: profile.id,
              email,
              name: profile.displayName ?? null
            });

            done(null, { userId: user.id });
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  return passport;
}

