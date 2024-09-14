import { validateRequest } from "@/auth"; // Import authentication validation function
import streamServerClient from "@/lib/stream"; // Import Stream server client for messaging services
import { MessageCountInfo } from "@/lib/types"; // Import TypeScript types for message count information

/**
 * GET Message Count Handler:
 *
 * This function handles the API route to fetch the total unread message count for the authenticated user.
 * It ensures the user is authenticated, retrieves the user's unread message count from the Stream service,
 * and returns the count as a JSON response.
 *
 * Key Features:
 * - Authentication: Validates if the user is logged in before proceeding.
 * - Stream Client Integration: Uses the Stream client to fetch the unread message count.
 * - Error Handling: Catches and logs any errors, and returns appropriate responses for errors.
 */
export async function GET() {
  try {
    // Validate the request and retrieve the authenticated user
    const { user } = await validateRequest();

    // If the user is not authenticated, return an unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the unread message count for the authenticated user from the Stream service
    const { total_unread_count } = await streamServerClient.getUnreadCount(
      user.id,
    );

    // Create the data object with the unread message count
    const data: MessageCountInfo = {
      unreadCount: total_unread_count,
    };

    // Return the unread message count as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any errors that occur during the process
    console.error(error);

    // Return an internal server error response if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
