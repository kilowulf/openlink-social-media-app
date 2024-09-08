"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

/**Delete Post: Server Action
 *
 */

export async function deletePost(id: string) {
  // authenticate user
  const { user } = await validateRequest();

  // check if user is present
  if (!user) {
    throw new Error("Unauthorized access");
  }

  // find post
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // check if post present
  if (!post) throw new Error("Post not found");

  // check if post belongs to user
  if (post.userId !== user.id) throw new Error("Unauthorized");

  // delete post
  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataInclude(user.id),
  });

  return deletedPost;
}
