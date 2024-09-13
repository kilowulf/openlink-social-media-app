import { validateRequest } from "@/auth"; // Importing authentication logic to validate user requests
import prisma from "@/lib/prisma"; // Prisma client for database interactions
import { getPostDataInclude, PostsPage } from "@/lib/types"; // Importing types and post data inclusion fields
import { NextRequest } from "next/server"; // Importing Next.js server-side request object

/**
 * GET Posts Handler:
 *
 * This function handles fetching a paginated list of posts for the logged-in user.
 * It uses cursor-based pagination to fetch older posts in batches (page size of 10) and ensures the user is authenticated.
 * The response includes the posts and a cursor for the next page.
 */

export async function GET(req: NextRequest) {
  try {
    // Retrieve the cursor for pagination from the query string (optional)
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Page size: Number of posts to fetch at a time
    const pageSize = 10;

    // Validate the request and retrieve the logged-in user's session
    const { user } = await validateRequest();

    // If the user is not logged in, return a 401 Unauthorized response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database for posts, including related data like user, likes, and bookmarks
    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id), // Include user, likes, bookmarks, and other related post data
      orderBy: { createdAt: "desc" }, // Order posts by creation date, most recent first
      take: pageSize + 1, // Fetch one more post than the page size to determine if there's more to paginate
      cursor: cursor ? { id: cursor } : undefined, // Use cursor-based pagination if a cursor is provided
    });

    // Determine if there's a next page by checking if more than pageSize posts were fetched
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    // Format the response data, slicing off the extra post if necessary
    const data: PostsPage = {
      posts: posts.slice(0, pageSize), // Return only the number of posts defined by pageSize
      nextCursor, // Provide the next cursor for pagination, if any
    };

    // Return the paginated posts as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any errors that occur during the process
    console.error(error);
    // Return a 500 Internal Server Error if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
