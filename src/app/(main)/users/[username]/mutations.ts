import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";

/**
 * useUpdateProfileMutation Hook:
 *
 * This hook handles the profile update process, including updating user details (such as display name or bio)
 * and uploading a new avatar if provided. It leverages the React Query `useMutation` to manage the asynchronous
 * mutation and integrates with the query cache to ensure that any relevant data (like posts from the updated user)
 * are automatically updated in the UI. It also includes error handling and success notifications using the `useToast` hook.
 *
 * Key Features:
 * - Updates user profile (display name, bio, etc.) via `updateUserProfile`.
 * - Optionally uploads a new avatar using `useUploadThing`.
 * - Invalidates and updates cached post data to reflect new user profile info.
 * - Displays success or error messages using `useToast`.
 */

export function useUpdateProfileMutation() {
  // Hook to display toast notifications
  const { toast } = useToast();

  // Next.js router, used to refresh the page after a successful profile update
  const router = useRouter();

  // React Query's QueryClient to interact with the cache
  const queryClient = useQueryClient();

  // Upload handler for avatar images
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  // React Query's `useMutation` hook, which manages the profile update process
  const mutation = useMutation({
    // Mutation function: handles both updating user profile and uploading the avatar (if provided)
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues; // User's updated profile values (e.g., display name, bio)
      avatar?: File; // Optional avatar file to upload
    }) => {
      // Execute the profile update and avatar upload in parallel
      return Promise.all([
        updateUserProfile(values), // Update user profile on the server
        avatar && startAvatarUpload([avatar]), // Upload avatar if provided
      ]);
    },
    // Success callback: Updates cached data and UI after a successful mutation
    onSuccess: async ([updatedUser, uploadResult]) => {
      // Retrieve the URL of the uploaded avatar (if available)
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;

      // Define the query filters for which queries to invalidate or update (post feed in this case)
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"], // Target the post feed queries
      };

      // Cancel any ongoing queries for post-feed to avoid race conditions
      await queryClient.cancelQueries(queryFilter);

      // Update cached post data in the query client to reflect the new user profile details
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return; // If no data, return early

          // Update each post, ensuring that the posts authored by the updated user have the new profile info
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                // Check if the post's user matches the updated user
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.avatarUrl, // Update avatar URL if a new one was uploaded
                    },
                  };
                }
                return post; // Return unchanged post if it's not the updated user
              }),
            })),
          };
        },
      );

      // Refresh the page to reflect the changes
      router.refresh();

      // Show a success toast notification
      toast({
        description: "Profile updated",
      });
    },
    // Error callback: Handles errors during the mutation process
    onError(error) {
      console.error(error); // Log the error for debugging
      // Show an error toast notification
      toast({
        variant: "destructive",
        description: "Failed to update profile.",
      });
    },
  });

  // Return the mutation object, which includes methods like `mutate` to trigger the mutation
  return mutation;
}
