import { validateRequest } from "@/auth"; // Importing authentication function to validate user requests
import prisma from "@/lib/prisma"; // Prisma client for interacting with the database
import { notificationsInclude, NotificationsPage } from "@/lib/types"; // Types for notifications and Prisma include fields
import { NextRequest } from "next/server"; // Importing Next.js server-side request object

/**
 * GET Notifications Handler:
 *
 * This function handles fetching a paginated list of notifications for the logged-in user.
 * It ensures the user is authenticated, retrieves notifications using cursor-based pagination,
 * and returns the relevant notifications along with a cursor for loading more.
 */

export async function GET(req: NextRequest) {
  try {
    // Extract the cursor from the query string (for pagination); it's optional
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Page size: Defines the number of notifications to retrieve per page
    const pageSize = 10;

    // Validate the user request and retrieve the logged-in user details
    const { user } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to retrieve notifications for the logged-in user
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: user.id, // Fetch notifications where the logged-in user is the recipient
      },
      include: notificationsInclude, // Include related fields such as the issuer and the post content
      orderBy: { createdAt: "desc" }, // Order notifications by their creation date (most recent first)
      take: pageSize + 1, // Fetch one more notification than the page size to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined, // Use cursor-based pagination if a cursor is provided
    });

    // Determine if there's a next page: If more than pageSize notifications are fetched, there is a next page
    const nextCursor =
      notifications.length > pageSize ? notifications[pageSize].id : null;

    // Prepare the response data by removing the extra notification fetched for pagination
    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize), // Only return the exact number of notifications defined by pageSize
      nextCursor, // Provide the next cursor for pagination, if any
    };

    // Return the paginated notifications as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any errors that occur during the process
    console.error(error);
    // Return a 500 Internal Server Error response if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
