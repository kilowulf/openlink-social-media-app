import { validateRequest } from "@/auth"; // Import function to validate the user's session
import streamServerClient from "@/lib/stream"; // Stream client for generating user tokens

/**
 * GET Token Handler:
 *
 * This API route generates a token for the logged-in user to interact with Stream's chat functionality.
 * The token is time-limited and requires the user to be authenticated before it can be issued.
 *
 * Key Features:
 * - User authentication via `validateRequest`.
 * - Token generation with expiration time using the Stream server client.
 * - Handles error cases and returns appropriate responses.
 */
export async function GET() {
  try {
    // Validate the user's session and get the logged-in user's data
    const { user } = await validateRequest();

    // Log the user ID for debugging purposes
    console.log("Calling get-token for user: ", user?.id);

    // If the user is not logged in, return a 401 Unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Define the token's expiration time (1 hour from the current time)
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

    // Set the issuedAt time (1 minute earlier to account for potential clock drift)
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    // Generate a token for the user using Stream's server client
    const token = streamServerClient.createToken(
      user.id, // User ID as the token subject
      expirationTime, // Token expiration time
      issuedAt, // Token issued time
    );

    // Return the generated token as a JSON response
    return Response.json({ token });
  } catch (error) {
    // Log any errors to the console for debugging
    console.error(error);

    // Return a 500 Internal Server Error if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
