import { validateRequest } from "@/auth"; // Authentication function to validate user sessions
import prisma from "@/lib/prisma"; // Prisma client for database interactions
import { NotificationCountInfo } from "@/lib/types"; // Type definition for the structure of notification count info

/**
 * GET Unread Notifications Count Handler:
 *
 * This API route handles fetching the count of unread notifications for the authenticated user.
 * It ensures the user is logged in before accessing their unread notifications, and returns the count.
 *
 * Key Features:
 * - Authorization: Ensures the user is logged in before fetching notification data.
 * - Fetches the count of unread notifications (those that haven't been marked as read).
 * - Returns a `NotificationCountInfo` object containing the unread notification count.
 */

export async function GET() {
  try {
    // Validate the request and retrieve the logged-in user
    const { user } = await validateRequest();

    // If the user is not logged in, return an unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database for the count of unread notifications for the logged-in user
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: user.id, // Only count notifications for the logged-in user
        read: false, // Only include unread notifications
      },
    });

    // Prepare the data to send back in the response
    const data: NotificationCountInfo = {
      unreadCount, // Number of unread notifications
    };

    // Return the count of unread notifications as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any errors that occur during execution
    console.error(error);

    // Return a 500 Internal Server Error response if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
