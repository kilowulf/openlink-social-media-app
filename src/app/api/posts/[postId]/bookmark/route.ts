import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/types";

/**
 * Bookmark API Handler:
 *
 * This code handles bookmark operations for posts, allowing users to bookmark, retrieve the bookmark status, or delete a bookmark for a specific post.
 * The operations are protected by user authentication, and if the user is unauthorized, a 401 error is returned.
 * It performs the following actions:
 * - `GET`: Checks if a post is bookmarked by the logged-in user.
 * - `POST`: Adds a bookmark for a post by the logged-in user.
 * - `DELETE`: Removes a bookmark for a post by the logged-in user.
 */

export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the request and retrieve the logged-in user's session
    const { user: loggedInUser } = await validateRequest();

    // If the user is not logged in, return an unauthorized response
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to check if the post is bookmarked by the logged-in user
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id, // Logged-in user's ID
          postId, // Post ID passed as a parameter
        },
      },
    });

    // Create the bookmark info response
    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark, // Boolean indicating whether the post is bookmarked
    };

    // Return the bookmark info as JSON
    return Response.json(data);
  } catch (error) {
    console.error(error); // Log any errors
    return Response.json({ error: "Internal server error" }, { status: 500 }); // Return a 500 response if something goes wrong
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the request and retrieve the logged-in user's session
    const { user: loggedInUser } = await validateRequest();

    // If the user is not logged in, return an unauthorized response
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert a bookmark for the post, or update if it already exists
    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id, // Logged-in user's ID
          postId, // Post ID passed as a parameter
        },
      },
      create: {
        userId: loggedInUser.id, // Create a new bookmark for the logged-in user and the post
        postId,
      },
      update: {}, // If a bookmark already exists, this won't change anything
    });

    // Return an empty response to indicate success
    return new Response();
  } catch (error) {
    console.error(error); // Log any errors
    return Response.json({ error: "Internal server error" }, { status: 500 }); // Return a 500 response if something goes wrong
  }
}

export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the request and retrieve the logged-in user's session
    const { user: loggedInUser } = await validateRequest();

    // If the user is not logged in, return an unauthorized response
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the bookmark associated with the logged-in user and the post
    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.id, // Logged-in user's ID
        postId, // Post ID passed as a parameter
      },
    });

    // Return an empty response to indicate success
    return new Response();
  } catch (error) {
    console.error(error); // Log any errors
    return Response.json({ error: "Internal server error" }, { status: 500 }); // Return a 500 response if something goes wrong
  }
}
