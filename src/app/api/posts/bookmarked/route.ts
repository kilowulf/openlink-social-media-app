// Import necessary utilities for request validation, database querying (Prisma), and types
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

/**
 * GET endpoint handler:
 * This function handles fetching paginated posts bookmarked by the authenticated user.
 * The posts are retrieved from the Prisma database and returned as a JSON response.
 *
 * - Pagination is supported via a cursor.
 * - The authenticated user is validated before retrieving the bookmarks.
 *
 * @param {NextRequest} req - The incoming request, containing query parameters for pagination (cursor).
 * @returns {Response} JSON response containing paginated bookmarks.
 */
export async function GET(req: NextRequest) {
  try {
    // Get pagination cursor from query params (if present) to handle pagination
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Define the number of posts to retrieve per page
    const pageSize = 10;

    // Validate the current user session
    const { user } = await validateRequest();

    // If no authenticated user is found, return an unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve the user's bookmarked posts from the Prisma database
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id, // Filter by the authenticated user's ID
      },
      include: {
        post: {
          include: getPostDataInclude(user.id), // Include related post data using a helper function for relevant fields
        },
      },
      orderBy: {
        createdAt: "desc", // Sort bookmarks by the most recent first
      },
      take: pageSize + 1, // Retrieve one extra record to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined, // Set the cursor for pagination (if present)
    });

    // Determine if there is a next cursor for pagination
    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    // Create the paginated response data, slicing out the extra post used for pagination
    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post), // Extract post data from bookmarks
      nextCursor, // Provide next cursor for continued pagination
    };

    // Return the paginated data as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any internal server errors
    console.error(error);
    // Return a 500 internal server error response
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
