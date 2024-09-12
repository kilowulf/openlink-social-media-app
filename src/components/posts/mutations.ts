import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { deletePost } from "./actions";

/**
 * useDeletePostMutation Hook:
 *
 * This hook handles the process of deleting a post and updating the UI by modifying the relevant query cache.
 * If the deleted post is currently being viewed on a dedicated page, it redirects the user to the author's profile.
 * Additionally, it provides success and error feedback using the `useToast` hook.
 *
 * Key functionalities:
 * - Deletes a post via `deletePost` function.
 * - Updates cached post feeds to remove the deleted post.
 * - Displays toast notifications for success or failure.
 * - Redirects the user if the deleted post is currently being viewed.
 */

export function useDeletePostMutation() {
  // Hook to display toast notifications
  const { toast } = useToast();

  // React Query's QueryClient to manage the cache of queries
  const queryClient = useQueryClient();

  // Router to handle navigation if necessary after deletion
  const router = useRouter();

  // Pathname hook to get the current page URL
  const pathname = usePathname();

  // `useMutation` hook to handle the deletion process
  const mutation = useMutation({
    mutationFn: deletePost, // The function to delete a post on the server
    /**
     * Success handler for the mutation. This function updates the cache to remove the deleted post
     * and navigates the user if they were viewing the deleted post directly.
     *
     * @param {Object} deletedPost - The post that was deleted
     */
    onSuccess: async (deletedPost) => {
      // Define query filters to target post feeds (e.g., timelines)
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      // Cancel ongoing queries for the targeted feeds to avoid race conditions
      await queryClient.cancelQueries(queryFilter);

      // Update the cached data to remove the deleted post from the relevant feeds
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return; // Return early if no data is found in the cache

          // Remove the deleted post from each page in the post feed
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor, // Keep pagination cursor unchanged
              posts: page.posts.filter((p) => p.id !== deletedPost.id), // Filter out the deleted post
            })),
          };
        },
      );

      // Show a success toast notification indicating the post has been deleted
      toast({
        description: "Post deleted",
      });

      // If the user is currently viewing the deleted post's page, redirect them to the author's profile
      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    /**
     * Error handler for the mutation. This function logs the error and displays a toast message to the user.
     *
     * @param {Error} error - The error encountered during the deletion process
     */
    onError(error) {
      // Log the error for debugging purposes
      console.error(error);

      // Display an error toast notification
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  // Return the mutation object, which includes methods like `mutate` to trigger the deletion
  return mutation;
}
