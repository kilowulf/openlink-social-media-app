"use client";

/**
 * Bookmarks Component:
 *
 * This component handles displaying a user's bookmarked posts. It fetches bookmarked posts using infinite scrolling, meaning
 * additional posts will load as the user scrolls to the bottom of the page. The component uses the `useInfiniteQuery` hook
 * from React Query to manage fetching data from the backend, handles potential loading states, and manages error handling
 * if any issues occur during the fetch process.
 */

// time: 3:49:27

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"; // Container for handling infinite scroll behavior
import Post from "@/components/posts/Post"; // Component for rendering individual posts
import PostsLoadingScaffolding from "@/components/posts/PostsLoadingScaffold"; // Loading skeleton to show while posts are loading
import kyInstance from "@/lib/kyFetchExtension"; // Extended fetch library for making HTTP requests
import { PostsPage } from "@/lib/types"; // TypeScript types for the Posts page structure
import { useInfiniteQuery } from "@tanstack/react-query"; // Hook for handling infinite scrolling queries
import { Loader2 } from "lucide-react"; // Icon used for loading spinner

export default function BookmarksFeed() {
  /**
   * useInfiniteQuery Hook:
   * - Handles fetching bookmarked posts from the server with infinite scrolling.
   * - The `queryFn` fetches data from the backend, while `getNextPageParam` determines if there are more posts to load.
   * - `status` tracks the query state (loading, success, error).
   */
  const {
    data, // Contains the fetched posts data.
    fetchNextPage, // Function to fetch the next page when user scrolls to the bottom.
    hasNextPage, // Whether there is more data to fetch.
    isFetching, // Whether a fetch operation is currently in progress.
    isFetchingNextPage, // Whether the next page is currently being fetched.
    status, // The status of the query (pending, success, error).
  } = useInfiniteQuery({
    queryKey: ["post-feed", "bookmarks"], // Unique key to identify the query (post-feed specific to bookmarks)
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/bookmarked",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(), // Fetches posts data, handles optional `cursor` for pagination
    initialPageParam: null as string | null, // Start from the first page (no cursor initially)
    getNextPageParam: (lastPage) => lastPage.nextCursor, // Determines the next cursor to fetch next set of posts
  });

  // Flattens the fetched pages into a single array of posts
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // If data is still loading, show the skeleton loading state
  if (status === "pending") {
    return <PostsLoadingScaffolding />;
  }

  // If no bookmarked posts exist and all pages are loaded, show a placeholder message
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        You don&apos;t have any bookmarks yet.
      </p>
    );
  }

  // If an error occurs while fetching the posts, display an error message
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading bookmarks.
      </p>
    );
  }

  // Main return block that displays the posts in an infinite scroll container
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()} // Fetch more posts when user scrolls to bottom
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} /> // Render each post
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
