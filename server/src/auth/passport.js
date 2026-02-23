import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { getEnv } from "../env.js";
import { getUserById, upsertOAuthUser } from "../store/memory.js";

export function configurePassport() {
  const env = getEnv();

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || null;
            const user = await upsertOAuthUser({
              provider: "google",
              providerId: profile.id,
              email,
              name: profile.displayName || null,
              adminEmails: env.ADMIN_EMAILS
            });
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL: env.GITHUB_CALLBACK_URL || "/auth/github/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || null;
            const user = await upsertOAuthUser({
              provider: "github",
              providerId: profile.id,
              email,
              name: profile.displayName || profile.username || null,
              adminEmails: env.ADMIN_EMAILS
            });
            done(null, user);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  return passport;
}
