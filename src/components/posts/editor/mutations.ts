import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";

/**
 * useSubmitPostMutation Hook:
 *
 * This hook manages the process of submitting a new post. It handles the post creation logic, updates relevant cached queries
 * (such as the post feed), and provides feedback (e.g., toast notifications) to the user based on the success or failure of
 * the post submission.
 *
 * Key Features:
 * - Uses the `submitPost` function to handle the actual API call for creating a new post.
 * - Invalidates and updates cached post feeds to reflect the newly created post.
 * - Provides feedback via toast notifications to indicate success or error during the post submission process.
 */

export function useSubmitPostMutation() {
  // Hook to display toast notifications
  const { toast } = useToast();

  // React Query's QueryClient to interact with cached data
  const queryClient = useQueryClient();

  // Retrieve session data (the logged-in user)
  const { user } = useSession();

  // Mutation hook to handle the post submission process
  const mutation = useMutation({
    mutationFn: submitPost, // Function that submits the post to the server

    // Success callback: updates the cache and shows a success toast
    onSuccess: async (newPost) => {
      // Define which queries to update after the post is submitted (e.g., post feeds)
      const queryFilter = {
        queryKey: ["post-feed"], // Target the "post-feed" query
        predicate(query) {
          return (
            query.queryKey.includes("for-you") || // Include "for-you" feed
            (query.queryKey.includes("user-posts") && // Include user-specific posts
              query.queryKey.includes(user.id)) // Filter for posts by the current user
          );
        },
      } satisfies QueryFilters;

      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries(queryFilter);

      // Update the cached post feed with the new post
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0]; // Get the first page of posts

          if (firstPage) {
            // Prepend the new post to the first page
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts], // Add the new post at the beginning
                  nextCursor: firstPage.nextCursor, // Keep the pagination cursor
                },
                ...oldData.pages.slice(1), // Include remaining pages
              ],
            };
          }
        },
      );

      // Invalidate any queries that did not have data (forces refetch)
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      // Show a success toast notification
      toast({
        description: "Post created",
      });
    },

    // Error callback: handles errors during the post submission process
    onError(error) {
      console.error(error); // Log the error for debugging

      // Show an error toast notification
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  // Return the mutation object, which includes methods like `mutate` to trigger the mutation
  return mutation;
}
