/**
 * Comment Mutation Hooks:
 *
 * This code provides two hooks, `useSubmitCommentMutation` and `useDeleteCommentMutation`, for handling comment submission and deletion.
 * The hooks leverage React Query's `useMutation` and `useQueryClient` to manage the process of updating the local cache
 * and displaying feedback to users via toast notifications.
 *
 * Key Operations:
 * 1. **useSubmitCommentMutation**: Handles submitting new comments, updates the cached data for the post's comments, and displays success or error toasts.
 * 2. **useDeleteCommentMutation**: Handles deleting comments, updates the cache to remove the comment, and shows appropriate feedback to the user.
 */

import { CommentsPage } from "@/lib/types"; // Type definitions for comment pages
import {
  InfiniteData, // Used for handling paginated data with React Query
  QueryKey, // React Query's query key type for identifying queries
  useMutation, // Hook for managing mutations (e.g., submit, delete)
  useQueryClient, // Hook for accessing the query client to manage cache
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast"; // Hook for displaying toast notifications
import { deleteComment, submitComment } from "./actions"; // Action functions for submitting and deleting comments

/**
 * useSubmitCommentMutation:
 *
 * Hook to handle submitting new comments. It updates the comments cache for the post, ensuring the new comment
 * is added to the first page of comments. It also displays toast notifications for success and error states.
 *
 * @param {string} postId - The ID of the post to which the comment is being added.
 * @returns The mutation object, including the `mutate` function to trigger the mutation.
 */
export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast(); // Toast hook for notifications
  const queryClient = useQueryClient(); // Access query client to manage cached data

  // Define the mutation to submit a comment
  const mutation = useMutation({
    mutationFn: submitComment, // Function that triggers the comment submission
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId]; // Key to identify the comments query for the post

      await queryClient.cancelQueries({ queryKey }); // Cancel any ongoing queries for the comments

      // Update the query data for comments
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0]; // Access the first page of comments

          if (firstPage) {
            return {
              pageParams: oldData.pageParams, // Preserve page parameters
              pages: [
                {
                  previousCursor: firstPage.previousCursor, // Preserve previous cursor
                  comments: [newComment, ...firstPage.comments], // Add new comment to the first page: [...firstPage.comments, newComment],
                },
                ...oldData.pages.slice(1), // Preserve the rest of the pages
              ],
            };
          }
        },
      );

      // Invalidate queries to refetch data where necessary
      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data; // Invalidate if there is no data
        },
      });

      // Show success toast notification
      toast({
        description: "Comment created",
      });
    },
    // Handle error case by showing an error toast
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to submit comment. Please try again.",
      });
    },
  });

  return mutation; // Return the mutation object for use in components
}

/**
 * useDeleteCommentMutation:
 *
 * Hook to handle deleting comments. It removes the comment from the cache and displays appropriate feedback via toast notifications.
 *
 * @returns The mutation object, including the `mutate` function to trigger the mutation.
 */
export function useDeleteCommentMutation() {
  const { toast } = useToast(); // Toast hook for notifications
  const queryClient = useQueryClient(); // Access query client to manage cached data

  // Define the mutation to delete a comment
  const mutation = useMutation({
    mutationFn: deleteComment, // Function that triggers the comment deletion
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId]; // Key to identify the comments query for the post

      await queryClient.cancelQueries({ queryKey }); // Cancel any ongoing queries for the comments

      // Update the query data to remove the deleted comment
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams, // Preserve page parameters
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor, // Preserve previous cursor
              comments: page.comments.filter((c) => c.id !== deletedComment.id), // Remove the deleted comment
            })),
          };
        },
      );

      // Show success toast notification
      toast({
        description: "Comment deleted",
      });
    },
    // Handle error case by showing an error toast
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });

  return mutation; // Return the mutation object for use in components
}
