// Prisma Adapter for Lucia Authentication
// This module integrates Lucia authentication with Prisma ORM for managing users and sessions.
// It also provides utility functions for session validation and handling session cookies.

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import prisma from "./lib/prisma";
import { cookies } from "next/headers";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";

/**
 * Adapter Configuration:
 * The PrismaAdapter connects Lucia's session and user management to the Prisma ORM,
 * allowing for database interactions when handling users and sessions.
 */
const adapter = new PrismaAdapter(prisma.session, prisma.user);

/**
 * Lucia Configuration:
 * - Configures session cookies to never expire unless explicitly set.
 * - In production, the cookies will be set as secure.
 * - Extracts necessary user attributes such as id, username, and displayName from the database.
 */
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production", // Ensure cookies are marked secure in production
    },
  },
  // Maps database attributes to user attributes
  getUserAttributes: (databaseUserAttributes) => {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
      githubId: databaseUserAttributes.githubId,
    };
  },
});

// Declare Lucia module augmentation for type safety when using Lucia within the app
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

// Interface defining the structure of user attributes fetched from the database
interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
  githubId: string | null;
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
);
/**
 * validateRequest:
 * This function validates if the current request is authenticated by checking the session ID stored in cookies.
 * It either returns the user and session data or null if the session is invalid or missing.
 */
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null; // Get session ID from the cookies.

    // If no session ID is found, return null values for user and session
    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await lucia.validateSession(sessionId); // Validate the session using Lucia.

    try {
      // If session is valid and fresh, refresh the session cookie
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }

      // If the session is missing, set a blank session cookie
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch (error) {
      console.error("Error refreshing session cookie", error); // Handle any errors that occur during session validation
    }

    return result; // Return the result which includes the user and session or null if invalid.
  },
);
