import kyInstance from "@/lib/kyFetchExtension";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useToast } from "../ui/use-toast";

/**
 * BookmarkButton Component:
 *
 * This component provides the functionality to bookmark or unbookmark a post.
 * It uses React Query for managing and caching the bookmark status, and provides visual feedback through a toast notification.
 * The button updates its state based on whether the post is bookmarked by the user.
 *
 * Features:
 * - Fetches and displays the current bookmark status of the post.
 * - Allows users to toggle the bookmark state (add or remove bookmark).
 * - Shows a toast notification to inform users of success or failure.
 * - Updates the UI and cache optimistically before the server responds.
 */

interface BookmarkButtonProps {
  postId: string; // The ID of the post to be bookmarked or unbookmarked
  initialState: BookmarkInfo; // Initial bookmark state passed as a prop (e.g., for SSR)
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  // Hook for showing toast notifications
  const { toast } = useToast();

  // React Query's QueryClient to handle cache updates
  const queryClient = useQueryClient();

  // Define the query key for the bookmark info (used for cache invalidation and updating)
  const queryKey: QueryKey = ["bookmark-info", postId];

  // Fetch bookmark information (whether the post is bookmarked by the user) using React Query
  const { data } = useQuery({
    queryKey, // Query key to identify the bookmark status for the given post
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(), // API call to fetch bookmark info
    initialData: initialState, // Use initial state (e.g., from SSR) to avoid unnecessary re-fetch
    staleTime: Infinity, // Cache the data indefinitely, as bookmark status does not change frequently
  });

  // Mutation to handle bookmark or unbookmark actions
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser // Check if the post is currently bookmarked
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`) // If bookmarked, send a DELETE request to unbookmark
        : kyInstance.post(`/api/posts/${postId}/bookmark`), // If not bookmarked, send a POST request to bookmark
    // Optimistically update UI and cache before server response
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`, // Show toast notification for bookmark/unbookmark action
      });

      // Cancel any ongoing queries related to bookmark info to prevent conflicts
      await queryClient.cancelQueries({ queryKey });

      // Get the previous bookmark state before making changes (for rollback in case of error)
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      // Update the bookmark state in the cache optimistically
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser, // Toggle the bookmark state
      }));

      return { previousState }; // Return the previous state for rollback in case of error
    },
    // Error handling: rollback cache to previous state and show an error toast
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState); // Rollback cache to previous state
      console.error(error); // Log the error for debugging
      toast({
        variant: "destructive", // Show an error toast notification
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    // Render the bookmark button and update the icon based on whether the post is bookmarked
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5", // Base size of the bookmark icon
          data.isBookmarkedByUser && "fill-primary text-primary", // If bookmarked, fill the icon with a primary color
        )}
      />
    </button>
  );
}
