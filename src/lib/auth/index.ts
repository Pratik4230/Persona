import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import { getDb, getMongoClient } from "@/lib/db/client";

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);
const githubConfigured =
  Boolean(process.env.GITHUB_CLIENT_ID) &&
  Boolean(process.env.GITHUB_CLIENT_SECRET);

function createAuth() {
  const client = getMongoClient();
  const db = getDb();

  return betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      "https://persona-pink.vercel.app",
    ].filter(Boolean),
    socialProviders: {
      ...(googleConfigured
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID as string,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
          }
        : {}),
      ...(githubConfigured
        ? {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID as string,
              clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            },
          }
        : {}),
    },
    user: {
      additionalFields: {
        bio: {
          type: "string",
          required: false,
          defaultValue: "",
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

/** Singleton Better Auth instance (lazy, created on first request). */
export function getAuth() {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}

export type Session = ReturnType<typeof getAuth>["$Infer"]["Session"];
