import { validateRequest } from "@/auth"; // Import function for authenticating the user making the request
import prisma from "@/lib/prisma"; // Prisma client used for interacting with the database
import { getPostDataInclude, PostsPage } from "@/lib/types"; // Import helper functions and types for post data structure and inclusion
import { NextRequest } from "next/server"; // Import the Next.js request object for handling server-side requests

/**
 * GET request handler for fetching posts based on a search query, with pagination.
 *
 * This handler allows authenticated users to retrieve a list of posts that match a specific search query,
 * with support for pagination. It uses full-text search to find posts whose content or author’s details match the query.
 * The results are paginated to improve performance and usability, returning only a limited number of posts per request.
 */
export async function GET(req: NextRequest) {
  try {
    // Retrieve the search query "q" from the request URL, or default to an empty string if not provided
    const q = req.nextUrl.searchParams.get("q") || "";

    // Retrieve the cursor from the query for pagination; undefined if no cursor is provided
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    /**
     * Prepare the search query for PostgreSQL full-text search by replacing spaces with the '&' operator.
     * This enables searching for multiple words in a more efficient and accurate way, treating them as "AND" conditions.
     */
    const searchQuery = q.split(" ").join(" & ");

    const pageSize = 10; // Define the number of posts to return per page

    // Authenticate the user making the request by validating their session/token
    const { user } = await validateRequest();

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * Fetch posts from the database where the content or the author's details match the search query.
     * Uses Prisma to query the database, combining filters on post content, user's display name, and username.
     * Pagination is managed by fetching one more record than required to check if there are additional pages.
     */
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              search: searchQuery, // Search in post content for matching terms
            },
          },
          {
            user: {
              displayName: {
                search: searchQuery, // Search in user's display name for matching terms
              },
            },
          },
          {
            user: {
              username: {
                search: searchQuery, // Search in user's username for matching terms
              },
            },
          },
        ],
      },
      include: getPostDataInclude(user.id), // Include necessary post and user-related data for the response
      orderBy: { createdAt: "desc" }, // Sort posts by creation date, with the newest posts first
      take: pageSize + 1, // Fetch one more post than required to check for additional pages
      cursor: cursor ? { id: cursor } : undefined, // Use the cursor for pagination if provided
    });

    // Determine if there's another page by checking if more than pageSize posts were retrieved
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    /**
     * Prepare the response object:
     * - Limit the posts returned to pageSize by slicing off the extra post
     * - Attach the cursor for the next page if available
     */
    const data: PostsPage = {
      posts: posts.slice(0, pageSize), // Return only the first pageSize posts
      nextCursor, // Include the next cursor for pagination
    };

    // Return the posts and pagination cursor in a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any errors that occur during the request
    console.error(error);

    // Return a 500 Internal Server Error response if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
