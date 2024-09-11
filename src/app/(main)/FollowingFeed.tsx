"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingScaffold from "@/components/posts/PostsLoadingScaffold";
import kyInstance from "@/lib/kyFetchExtension";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

/**
 * FollowingFeed Component:
 *
 * This component displays a feed of posts from the users that the current user is following.
 * It implements infinite scrolling, which means new posts are automatically loaded when the user scrolls down.
 *
 * Uses `react-query`'s `useInfiniteQuery` for efficient pagination and fetching of data in pages,
 * making the scrolling experience smooth. Handles various states like loading, errors, and the case
 * where no posts are available to display.
 */

export default function FollowingFeed() {
  // Infinite scroll query for fetching posts from followed users
  const {
    data, // contains the paginated post data
    fetchNextPage, // function to load the next page of posts
    isFetching, // flag to indicate if data is being fetched
    hasNextPage, // indicates if more pages are available for loading
    isFetchingNextPage, // flag for the status of fetching the next page
    status, // overall status of the query ('success', 'error', 'loading', etc.)
  } = useInfiniteQuery({
    // Setting up the query key and fetch function for retrieving the posts
    queryKey: ["posts-feed", "following"], // unique key to identify the query (for caching purposes)
    queryFn: ({ pageParam }) =>
      // Fetches the posts, using cursor-based pagination
      kyInstance
        .get(
          "/api/posts/following",
          pageParam ? { searchParams: { cursor: pageParam } } : {}, // adding cursor (pageParam) to enable pagination
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null, // initially, no cursor is provided (first page)
    getNextPageParam: (lastPage) => lastPage.nextCursor, // determines the next page to load based on the last page's cursor
  });

  // Collect all posts from the pages into a flat array
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Status handling: show loading scaffold if query is pending
  if (status === "pending") {
    return <PostsLoadingScaffold />;
  }

  // Status handling: no posts available message
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No posts found. Begin following others to see their posts here.
      </p>
    );
  }

  // Status handling: show error message if something went wrong during fetching
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        Error occurred while loading posts
      </p>
    );
  }

  // Main render of the component
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      // Fetch next page when bottom of container is reached
    >
      {posts.map((post) => (
        // Render each post in the feed
        <Post key={post.id} post={post} />
      ))}
      {/* Show loading spinner when fetching more pages */}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
