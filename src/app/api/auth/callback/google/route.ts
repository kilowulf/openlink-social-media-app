import { google, lucia } from "@/auth"; // Import Google and Lucia authentication modules
import kyInstance from "@/lib/kyFetchExtension"; // HTTP client for making API requests
import prisma from "@/lib/prisma"; // Prisma ORM for database interaction
import streamServerClient from "@/lib/stream"; // Client for handling Stream chat functionality
import { slugify } from "@/lib/utils"; // Utility function to convert names into URL-friendly slugs
import { OAuth2RequestError } from "arctic"; // Error handling class for OAuth2
import { generateIdFromEntropySize } from "lucia"; // Generates a unique user ID
import { cookies } from "next/headers"; // Helper for reading and setting cookies in Next.js
import { NextRequest } from "next/server"; // Next.js request object for server-side routing

/**
 * GET handler for processing Google OAuth callback.
 *
 * This function is called after the user has authenticated with Google.
 * It verifies the OAuth state and code, retrieves the user's profile from Google,
 * and creates or logs in the user in the system.
 */
export async function GET(req: NextRequest) {
  // Extract the OAuth authorization code and state from the URL parameters
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  // Retrieve the state and code verifier stored in the cookies
  const storedState = cookies().get("state")?.value;
  const storedCodeVerifier = cookies().get("code_verifier")?.value;

  // If any of the required parameters are missing or state does not match, return a 400 Bad Request
  if (
    !code || // Authorization code from Google
    !state || // State to prevent CSRF attacks
    !storedState || // Previously stored state from the initial OAuth request
    !storedCodeVerifier || // PKCE code verifier
    state !== storedState // Ensure that the received state matches the stored one
  ) {
    return new Response(null, { status: 400 }); // Return a 400 error for invalid request
  }

  try {
    // Exchange the authorization code for access tokens using the stored code verifier
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // Retrieve the authenticated user's profile information from Google's API
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`, // Pass the access token to authorize the request
        },
      })
      .json<{ id: string; name: string }>(); // Extract the user's ID and name from the response

    // Check if the user already exists in the database by their Google ID
    const existingUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id, // Query by Google ID
      },
    });

    // If the user exists, create a new session and set the session cookie
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {}); // Create session for the user
      const sessionCookie = lucia.createSessionCookie(session.id); // Create a session cookie
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return new Response(null, {
        status: 302, // Redirect to the homepage
        headers: {
          Location: "/", // Redirect to the home page
        },
      });
    }

    // If the user doesn't exist, create a new user record
    const userId = generateIdFromEntropySize(10); // Generate a unique user ID

    // Generate a unique username by slugifying the user's name and adding a random suffix
    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

    // Create the user and store in both the local database and Stream's user system
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId, // Assign generated user ID
          username, // Generated username
          displayName: googleUser.name, // Display name from Google's profile
          googleId: googleUser.id, // Store Google ID for future login reference
        },
      });
      await streamServerClient.upsertUser({
        id: userId, // Register user in Stream chat service
        username,
        name: username,
      });
    });

    // Create a new session for the newly created user
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id); // Create session cookie
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Redirect the user to the homepage after successful registration and login
    return new Response(null, {
      status: 302, // Redirect to homepage
      headers: {
        Location: "/", // Redirect to home page
      },
    });
  } catch (error) {
    // If an OAuth-related error occurs, return a 400 Bad Request
    console.error(error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400, // Bad Request for OAuth errors
      });
    }
    // If a different error occurs, return a 500 Internal Server Error
    return new Response(null, {
      status: 500, // Internal server error
    });
  }
}
