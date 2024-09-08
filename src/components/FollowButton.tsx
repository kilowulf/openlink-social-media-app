"use client";

import { FollowerInfo } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import { Button } from "./ui/button";
import kyInstance from "@/lib/kyFetchExtension";

/** Follow Button Component:
 * This component handles the follow/unfollow functionality.
 * It allows users to follow or unfollow another user and updates the UI accordingly.
 *
 * Props:
 * - `userId`: The ID of the user to be followed or unfollowed.
 * - `initialState`: Initial follower information, used to display whether the current user is already following the target user.
 */
interface FollowButtonProps {
  userId: string; // The ID of the user to follow or unfollow.
  initialState: FollowerInfo; // Initial state of the follower info (used for SSR or initial loading).
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  // Toast hook to show feedback messages to the user, such as success or error notifications.
  const { toast } = useToast();

  // React Query's QueryClient to interact with the cache and manually update it after a mutation.
  const queryClient = useQueryClient();

  // Custom hook to get the current follower information for the user.
  // This fetches whether the current user is following the target user, and how many followers the user has.
  const { data } = useFollowerInfo(userId, initialState);

  // Query key used to identify and update the query cache for this specific user and follower info.
  const queryKey: QueryKey = ["follower-info", userId];

  // useMutation hook to handle the follow/unfollow action.
  // The mutationFn dynamically calls either a DELETE or POST request based on whether the user is already following.
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`) // Unfollow the user (DELETE request).
        : kyInstance.post(`/api/users/${userId}/followers`), // Follow the user (POST request).

    // Optimistic updates: Before the mutation occurs, we update the cache to reflect the follow/unfollow state immediately.
    onMutate: async () => {
      // Cancel any ongoing queries for follower info to avoid race conditions.
      await queryClient.cancelQueries({ queryKey });

      // Get the current state of the followers and follow status from the cache.
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      // Optimistically update the cache to reflect the new follower state.
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1), // Update follower count (+1 if following, -1 if unfollowing).
        isFollowedByUser: !previousState?.isFollowedByUser, // Toggle the follow/unfollow state.
      }));

      // Return the previous state so we can revert the changes in case of an error.
      return { previousState };
    },

    // Error handling: In case the mutation fails, revert the cache to its previous state.
    onError(error, variables, context) {
      // Restore the previous state from context in case of an error.
      queryClient.setQueryData(queryKey, context?.previousState);

      // Log the error and show an error toast to the user.
      console.error(error);
      toast({
        variant: "destructive", 
        description: "Something went wrong. Please try again.", 
      });
    },

    // (Optional) onSuccess and onSettled callbacks can be added here to refetch or further update the cache.
  });

  return (
    // Button component that shows the follow/unfollow state.
    // The variant changes based on whether the user is currently following ("Following" or "Follow" state).
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"} // Button style changes based on follow state.
      onClick={() => mutate()} // When the button is clicked, the follow/unfollow mutation is triggered.
    >
      {data.isFollowedByUser ? "Following" : "Follow"}
    </Button>
  );
}
