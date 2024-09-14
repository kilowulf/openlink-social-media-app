import { google } from "@/auth"; // Import Google authentication helper
import { generateCodeVerifier, generateState } from "arctic"; // Import helper functions to generate OAuth state and code verifier
import { cookies } from "next/headers"; // Import cookie management from Next.js headers

/**
 * GET handler for initiating the Google OAuth login process.
 *
 * This function generates the required state and code verifier for OAuth,
 * creates an authorization URL using Google's OAuth service, and sets cookies
 * for the state and code verifier to be used during the callback verification process.
 * It then redirects the user to the generated Google authorization URL to complete login.
 */
export async function GET() {
  // Generate a unique state string to prevent CSRF attacks
  const state = generateState();

  // Generate a code verifier for the OAuth PKCE flow
  const codeVerifier = generateCodeVerifier();

  // Create the Google OAuth authorization URL with required scopes (profile, email)
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"], // Request access to user's profile and email
  });

  // Set a cookie for the OAuth state to verify it during the callback
  cookies().set("state", state, {
    path: "/", // The cookie is available across the entire site
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    httpOnly: true, // Cookie is not accessible via JavaScript (for security)
    maxAge: 60 * 10, // Cookie expires in 10 minutes
    sameSite: "lax", // Prevent CSRF attacks by enforcing same-site cookie policy
  });

  // Set a cookie for the OAuth PKCE code verifier for later use in the token exchange
  cookies().set("code_verifier", codeVerifier, {
    path: "/", // The cookie is available across the entire site
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    httpOnly: true, // Cookie is not accessible via JavaScript (for security)
    maxAge: 60 * 10, // Cookie expires in 10 minutes
    sameSite: "lax", // Prevent CSRF attacks by enforcing same-site cookie policy
  });

  // Redirect the user to the Google authorization URL to initiate the login process
  return Response.redirect(url);
}
