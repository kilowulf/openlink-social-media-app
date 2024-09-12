import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";

// API handler for fetching like information for a specific post
export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the logged-in user
    const { user: loggedInUser } = await validateRequest();

    // Check if the user is authorized (logged in)
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the post and check if the user has liked it, along with the total like count
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: { userId: loggedInUser.id }, // Check if the logged-in user has liked the post
          select: { userId: true }, // Only return the userId
        },
        _count: { select: { likes: true } }, // Get the total like count
      },
    });

    // If the post is not found, return a 404 error
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Create a LikeInfo object containing the like count and if the user has liked the post
    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length, // If the array is not empty, the user has liked the post
    };

    // Return the like information
    return Response.json(data);
  } catch (error) {
    // Handle any errors and return a 500 internal server error
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// API handler for liking a post
export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the logged-in user
    const { user: loggedInUser } = await validateRequest();

    // Check if the user is authorized (logged in)
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }, // Get the post owner's userId
    });

    // If the post is not found, return a 404 error
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Perform the like operation in a database transaction
    await prisma.$transaction([
      // Create or update the "like" record
      prisma.like.upsert({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
        create: {
          userId: loggedInUser.id,
          postId,
        },
        update: {}, // No-op if the like already exists
      }),
      // If the logged-in user is not the post owner, create a notification
      ...(loggedInUser.id !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id, // The user who liked the post
                recipientId: post.userId, // The owner of the post
                postId, // The post ID
                type: "LIKE", // The notification type
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    // Handle any errors and return a 500 internal server error
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// API handler for unliking a post
export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    // Validate the logged-in user
    const { user: loggedInUser } = await validateRequest();

    // Check if the user is authorized (logged in)
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }, // Get the post owner's userId
    });

    // If the post is not found, return a 404 error
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Perform the unlike operation in a database transaction
    await prisma.$transaction([
      // Delete the like record
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId,
        },
      }),
      // Delete the associated notification
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id, // The user who liked the post
          recipientId: post.userId, // The post owner
          postId, // The post ID
          type: "LIKE", // Notification type
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    // Handle any errors and return a 500 internal server error
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
