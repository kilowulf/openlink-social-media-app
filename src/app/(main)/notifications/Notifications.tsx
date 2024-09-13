"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"; // Container for infinite scrolling functionality
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingScaffold"; // Loading skeleton displayed when notifications are being fetched
import kyInstance from "@/lib/kyFetchExtension"; // Extended Ky instance for making HTTP requests
import { NotificationsPage } from "@/lib/types"; // Type definition for the structure of paginated notifications
import {
  useInfiniteQuery, // React Query hook for managing infinite scrolling of data
  useMutation, // React Query hook for handling mutations (e.g., marking notifications as read)
  useQueryClient, // React Query hook for interacting with the query cache
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Icon for loading spinner
import { useEffect } from "react"; // React hook for running side effects
import Notification from "./Notification"; // Component that renders individual notifications

/**
 * Notifications Component:
 *
 * This component manages the display of user notifications, implementing infinite scrolling to load more notifications as the user
 * scrolls down the page. It also marks notifications as "read" upon loading using a mutation. The component handles the following:
 * - Fetching paginated notifications from the server using `useInfiniteQuery`.
 * - Marking notifications as "read" using `useMutation`.
 * - Handling loading, error, and empty states for notifications.
 */
export default function Notifications() {
  // useInfiniteQuery: Fetch notifications with infinite scrolling
  const {
    data, // Paginated data returned from the query
    fetchNextPage, // Function to fetch the next page of notifications
    hasNextPage, // Whether there are more pages of notifications to load
    isFetching, // Whether data is currently being fetched
    isFetchingNextPage, // Whether the next page of notifications is currently being fetched
    status, // The status of the query (pending, success, error)
  } = useInfiniteQuery({
    queryKey: ["notifications"], // Unique key to identify the notifications query in the cache
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications", // API endpoint to fetch notifications
          pageParam ? { searchParams: { cursor: pageParam } } : {}, // Pagination using cursor
        )
        .json<NotificationsPage>(), // Parsing the response as a NotificationsPage object
    initialPageParam: null as string | null, // Initial page param (null means first page)
    getNextPageParam: (lastPage) => lastPage.nextCursor, // Determines the next cursor for pagination
  });

  const queryClient = useQueryClient(); // Access the query client to manage cache updates

  // useMutation: Mark notifications as "read"
  const { mutate } = useMutation({
    mutationFn: () => kyInstance.patch("/api/notifications/mark-as-read"), // API call to mark notifications as read
    onSuccess: () => {
      // On success, update the unread notifications count to 0 in the cache
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error); // Log any errors that occur during the mutation
    },
  });

  // useEffect: Automatically mark notifications as read when the component loads
  useEffect(() => {
    mutate(); // Trigger the mutation to mark notifications as read
  }, [mutate]); // Dependency array ensures this effect runs once when the component mounts

  // Combine the notifications data from all loaded pages
  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  // If the query is still loading, show a loading skeleton
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // If the query is successful but there are no notifications, display a placeholder message
  if (status === "success" && !notifications.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        You don&apos;t have any notifications yet.
      </p>
    );
  }

  // If an error occurs while fetching notifications, display an error message
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading notifications.
      </p>
    );
  }

  // Render the list of notifications with infinite scrolling
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()} // Fetch more notifications when the bottom is reached
    >
      {/* Map over the notifications and render each one */}
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
      {/* Show a loading spinner if the next page is being fetched */}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
