"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

/**Validate Posts: Server action */
/**
 * submitPost function:
 * This server-side function is responsible for handling the submission of new posts by authenticated users.
 * It performs several key operations, including user authentication, validation of the post data,
 * and interaction with the database to store the post and associated media attachments.
 *
 * Operations:
 * 1. Validates the user's session.
 * 2. Validates the input data (content and media attachments) against the schema.
 * 3. Interacts with the database to store the new post and link media attachments.
 * 4. Returns the newly created post along with necessary post data.
 */

export async function submitPost(input: {
  content: string; // Content of the post submitted by the user
  mediaIds: string[]; // Array of media IDs linked to the post (images, videos, etc.)
}) {
  // Step 1: Validate the user's authentication/session
  const { user } = await validateRequest();

  // Step 2: Check if a valid user exists (authentication guard)
  if (!user) {
    throw new Error("Unauthorized access");
  }

  // Step 3: Parse and validate the input against the predefined post schema
  const { content, mediaIds } = createPostSchema.parse(input);

  // Step 4: Create a new post in the database, linking user and media attachments
  const newPost = await prisma.post.create({
    data: {
      content, // Text content of the post
      userId: user.id, // Link the post to the authenticated user's ID
      attachments: {
        connect: mediaIds.map((id) => ({ id })), // Associate the post with media attachments using media IDs
      },
    },
    include: getPostDataInclude(user.id), // Includes necessary related post data (e.g., user details, media)
  });

  // Step 5: Return the newly created post, including the attached media and related post information
  return newPost;
}
