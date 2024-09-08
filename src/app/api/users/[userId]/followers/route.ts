/**Route: Followers db
 * GET: return the followers array of a given user
 * POST: write new follower to db
 */

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // get current user
    const { user: loggedInUser } = await validateRequest();
    // authenticate
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // retrieve user followers
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Post endpoint
export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // get current user
    const { user: loggedInUser } = await validateRequest();
    // authenticate
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    // check for existing follower: create or update if necessary
    await prisma.follow.upsert({
      // look for record
      where: {
        followerId_followingId: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      // create record
      create: { followerId: loggedInUser.id, followingId: userId },
      // update record
      update: {},
    });
    return new Response();
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete endpoint
export async function DELETE(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    // get current user
    const { user: loggedInUser } = await validateRequest();
    // authenticate
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    // check for existing follower: Delete if present
    await prisma.follow.deleteMany({
      // look for record
      where: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
    });
    return new Response();
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
