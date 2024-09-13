/**
 * GET Comments Handler:
 *
 * This API route handles fetching paginated comments for a specific post. It supports pagination by using a cursor to fetch older comments,
 * and it ensures that the user is authorized before allowing access to the comments.
 *
 * Key Features:
 * - Pagination: Uses a cursor to retrieve older comments in batches (page size of 5).
 * - Authorization: Ensures that the user is logged in before fetching the comments.
 * - Returns a `CommentsPage` object containing the comments and the cursor for the next set of comments.
 */

import { validateRequest } from "@/auth"; // Importing authentication logic to validate user requests
import prisma from "@/lib/prisma"; // Prisma client for database interactions
import { CommentsPage, getCommentDataInclude } from "@/lib/types"; // Types for CommentsPage and comment query includes
import { NextRequest } from "next/server"; // Next.js request object

export async function GET(
  req: NextRequest, // Request object for the API
  { params: { postId } }: { params: { postId: string } }, // Destructuring postId from the request params
) {
  try {
    // Retrieve the cursor for pagination from the query string (optional)
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Page size: Number of comments to fetch at a time
    const pageSize = 5;

    // Validate the request and get the logged-in user
    const { user } = await validateRequest();

    // If the user is not logged in, return an unauthorized error response
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database for comments associated with the specified postId
    const comments = await prisma.comment.findMany({
      where: { postId }, // Fetch comments for the specific post
      include: getCommentDataInclude(user.id), // Include user-related data for the comment (e.g., user details)
      orderBy: { createdAt: "asc" }, // Order comments by creation date in ascending order
      take: -pageSize - 1, // Fetch one extra comment to determine if there's more to paginate: -pageSize - 1,
      cursor: cursor ? { id: cursor } : undefined, // Use cursor-based pagination if cursor is provided
    });

    // If more comments exist, the previousCursor is set to the first comment's id
    const previousCursor = comments.length > pageSize ? comments[0].id : null;

    // Format the response data by slicing off the extra comment if there are more than pageSize comments
    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments, // If extra comment is fetched, remove it
      previousCursor, // Cursor for loading the previous page of comments
    };

    // Return the paginated comments as a JSON response
    return Response.json(data);
  } catch (error) {
    // Log any errors for debugging
    console.error(error);
    // Return a 500 Internal Server Error if something goes wrong
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
