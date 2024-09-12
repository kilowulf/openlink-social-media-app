import kyInstance from "@/lib/kyFetchExtension";
import { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useToast } from "../ui/use-toast";

/**
 * LikeButton Component:
 *
 * This component allows users to like or unlike a post. It manages the like state using React Query for caching
 * and synchronizes with the server using API calls. The button updates optimistically, meaning the UI updates
 * before receiving the server's response to provide a smoother user experience.
 *
 * Key Features:
 * - Displays the like button and like count for a post.
 * - Uses React Query to fetch, update, and cache like data.
 * - Handles optimistic UI updates to reflect the like/unlike action immediately.
 * - Displays toast notifications in case of errors.
 */

interface LikeButtonProps {
  postId: string; // The ID of the post for which the like button is displayed
  initialState: LikeInfo; // The initial like information, such as the like count and whether the user has liked it
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  // Hook to display toast notifications
  const { toast } = useToast();

  // React Query's QueryClient to interact with the cache
  const queryClient = useQueryClient();

  // Query key for fetching like information for a specific post
  const queryKey: QueryKey = ["like-info", postId];

  // Use React Query's `useQuery` to fetch the like info (count and whether user liked the post)
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(), // API call to fetch like info
    initialData: initialState, // Initialize with the provided state to avoid delay in rendering
    staleTime: Infinity, // Cache the result indefinitely (until explicitly invalidated)
  });

  // Mutation for handling like/unlike actions (optimistic updates)
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser // Determine whether the user has liked the post
        ? kyInstance.delete(`/api/posts/${postId}/likes`) // Unlike the post if already liked
        : kyInstance.post(`/api/posts/${postId}/likes`), // Like the post if not yet liked

    // Optimistically update the like count and state before receiving server response
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey }); // Cancel any ongoing queries to avoid race conditions

      // Capture the previous like state before updating it
      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      // Optimistically update the like state in the cache
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1), // Adjust like count based on whether the user had already liked the post
        isLikedByUser: !previousState?.isLikedByUser, // Toggle the liked state
      }));

      // Return the previous state so it can be restored in case of an error
      return { previousState };
    },

    // Handle errors by reverting to the previous state and showing a toast notification
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState); // Revert to the previous state if the mutation fails
      console.error(error); // Log the error
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.", // Show an error message
      });
    },
  });

  // Render the like button with the like count
  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      {/* Display the heart icon, filled red if the post is liked by the user */}
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500", // Conditionally fill the heart red if liked
        )}
      />
      {/* Display the number of likes */}
      <span className="text-sm font-medium tabular-nums">
        {data.likes} <span className="hidden sm:inline">likes</span>
        {/* Only show "likes" text on small screens */}
      </span>
    </button>
  );
}
