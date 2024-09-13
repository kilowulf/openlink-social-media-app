import { validateRequest } from "@/auth"; // Import function to validate the user's request (authentication check)
import prisma from "@/lib/prisma"; // Prisma client for database interaction
import { FollowerInfo } from "@/lib/types"; // Import type definitions

/**
 * Follower API Route:
 *
 * This API route handles follow-related actions for a user, including fetching follower information,
 * adding a new follower, and removing an existing follower. The user must be authenticated before any action.
 *
 * - GET: Fetches follower information for a specific user.
 * - POST: Adds a follow relation for the logged-in user.
 * - DELETE: Removes a follow relation for the logged-in user.
 *
 * Handles proper authentication and error management.
 */

// Fetch follower info for a specific user
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } }, // Extracting userId from request params
) {
  try {
    // Validate the logged-in user's request (authentication check)
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return an unauthorized error
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database to find the target user and count their followers
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id, // Check if the logged-in user is following the target user
          },
          select: {
            followerId: true, // Select the follower's ID
          },
        },
        _count: {
          select: {
            followers: true, // Count the total number of followers
          },
        },
      },
    });

    // If the user is not found, return a 404 error
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare the response data (follower count and whether the user is followed by the logged-in user)
    const data: FollowerInfo = {
      followers: user._count.followers, // Total number of followers
      isFollowedByUser: !!user.followers.length, // Boolean indicating if logged-in user follows the target user
    };

    // Return the follower information as JSON
    return Response.json(data);
  } catch (error) {
    // Log and return an internal server error if something goes wrong
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a follow relationship between the logged-in user and the target user
export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } }, // Extracting userId from request params
) {
  try {
    // Validate the logged-in user's request (authentication check)
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return an unauthorized error
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Perform a transaction to create a follow relationship and trigger a notification
    await prisma.$transaction([
      // Create or update the follow relationship
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id, // Logged-in user's ID
            followingId: userId, // Target user's ID
          },
        },
        create: {
          followerId: loggedInUser.id, // Insert new follow relationship
          followingId: userId,
        },
        update: {}, // If it already exists, do nothing
      }),
      // Create a notification for the follow event
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id, // ID of the user who issued the follow
          recipientId: userId, // ID of the user being followed
          type: "FOLLOW", // Notification type
        },
      }),
    ]);

    // Return a success response (empty indicates success)
    return new Response();
  } catch (error) {
    // Log and return an internal server error if something goes wrong
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Remove a follow relationship between the logged-in user and the target user
export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } }, // Extracting userId from request params
) {
  try {
    // Validate the logged-in user's request (authentication check)
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return an unauthorized error
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Perform a transaction to remove the follow relationship and related notifications
    await prisma.$transaction([
      // Remove the follow relationship
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id, // Logged-in user's ID
          followingId: userId, // Target user's ID
        },
      }),
      // Remove notifications related to the follow event
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id, // Logged-in user's ID
          recipientId: userId, // Target user's ID
          type: "FOLLOW", // Only delete notifications of type 'FOLLOW'
        },
      }),
    ]);

    // Return a success response (empty indicates success)
    return new Response();
  } catch (error) {
    // Log and return an internal server error if something goes wrong
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
