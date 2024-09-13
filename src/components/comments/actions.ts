"use server";
/**
 * Comment Management Functions (Server-Side):
 *
 * This code handles the creation and deletion of comments on posts. It validates requests to ensure
 * only authenticated users can perform these actions and enforces schema validation on the submitted data.
 *
 * Key Operations:
 * 1. **submitComment**: Creates a new comment on a post, sends a notification to the post's owner
 *    (if the commenter and owner are different), and validates user input.
 * 2. **deleteComment**: Deletes an existing comment, ensuring the user deleting it is the original commenter.
 */

import { validateRequest } from "@/auth"; // Handles request validation (authentication)
import prisma from "@/lib/prisma"; // Prisma client for database interaction
import { getCommentDataInclude, PostData } from "@/lib/types"; // Utility to select related comment data, post type definition
import { createCommentSchema } from "@/lib/validation"; // Schema for validating comment content

/**
 * submitComment:
 * - Creates a new comment on a specific post.
 * - If the commenter is not the owner of the post, a notification is triggered.
 * - Validates the comment content before saving.
 *
 * @param {PostData} post - The post where the comment is being added.
 * @param {string} content - The content of the comment.
 * @returns The newly created comment.
 */
export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  // Validate the user making the request
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  // Validate comment content with schema
  const { content: contentValidated } = createCommentSchema.parse({ content });

  // Create a new comment and optionally send a notification if commenter isn't the post owner
  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id, // Commenting user
      },
      include: getCommentDataInclude(user.id), // Include necessary related data for the comment
    }),
    ...(post.user.id !== user.id // If the commenter is not the post's owner, create a notification
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id, // Commenter
              recipientId: post.user.id, // Post owner
              postId: post.id, // Post being commented on
              type: "COMMENT", // Type of notification
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

/**
 * deleteComment:
 * - Deletes a comment by its ID, only if the request is made by the original commenter.
 *
 * @param {string} id - The ID of the comment to be deleted.
 * @returns The deleted comment data.
 */
export async function deleteComment(id: string) {
  // Validate the user making the request
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  // Find the comment by its ID
  const comment = await prisma.comment.findUnique({
    where: { id },
  });
  if (!comment) throw new Error("Comment not found");

  // Ensure the comment belongs to the requesting user
  if (comment.userId !== user.id) throw new Error("Unauthorized");

  // Delete the comment and return the deleted data
  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id), // Include necessary related data for the deleted comment
  });

  return deletedComment;
}
