"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

/**Validate Posts: Server action */

export async function submitPost(input: string) {
  // retrieve validated user
  const { user } = await validateRequest();
  // check if user is present
  if (!user) {
    throw new Error("Unauthorized access");
  }

  // retrieve post schema
  const { content } = createPostSchema.parse({ content: input });
  // create post to pass to postgres db
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
    include: postDataInclude,
  });

  return newPost;
}
