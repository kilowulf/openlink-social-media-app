import { validateRequest } from "@/auth"; // Authentication function to validate user sessions
import prisma from "@/lib/prisma"; // Prisma client for database interactions

/**
 * PATCH Mark Notifications as Read Handler:
 *
 * This API route marks all unread notifications for the authenticated user as "read". It ensures the user is logged in before
 * performing the update and handles errors appropriately.
 *
 * Key Features:
 * - Authorization: Ensures the user is logged in before updating notification statuses.
 * - Updates unread notifications: Sets the `read` field of all unread notifications to `true` for the current user.
 * - No response body: Simply returns an empty response on success.
 */

export async function PATCH() {
  try {
    // Validate the request and retrieve the logged-in user
    const { user } = await validateRequest();

    // If the user is not logged in, return an unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update all unread notifications for the logged-in user, setting them as "read"
    await prisma.notification.updateMany({
      where: {
        recipientId: user.id, // Only target notifications for the logged-in user
        read: false, // Only update notifications that are still unread
      },
      data: {
        read: true, // Set the `read` status to `true` (mark as read)
      },
    });

    // Return an empty response indicating success
    return new Response();
  } catch (error) {
    // Log any errors that occur during execution
    console.error(error);

    // Return a 500 Internal Server Error response if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
