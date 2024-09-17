"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"; 
import Post from "@/components/posts/Post";
import PostsLoadingScaffold from "@/components/posts/PostsLoadingScaffold"; 
import kyInstance from "@/lib/kyFetchExtension"; 
import { PostsPage } from "@/lib/types"; 
import { useInfiniteQuery } from "@tanstack/react-query"; 
import { Loader2 } from "lucide-react"; 

// Interface defining the props structure for the search results component
interface SearchResultsProps {
  query: string; // The search query string passed to the component
}

/**
 * SearchResults Component:
 *
 * This component fetches and displays paginated search results based on a query. It utilizes infinite scrolling,
 * allowing users to load more posts as they scroll down the page. It handles the loading state, error handling, and
 * empty results case efficiently.
 *
 * Key Features:
 * - Infinite scrolling with `useInfiniteQuery` from react-query
 * - Loading and error handling for fetching posts
 * - Displays search results as a list of `Post` components
 * - Uses `PostsLoadingScaffold` during initial load
 * - Fetches the next page when the bottom of the container is reached
 */
export default function SearchResults({ query }: SearchResultsProps) {
  // Use the `useInfiniteQuery` hook to handle paginated fetching of search results
  const {
    data, // The accumulated data of fetched pages
    fetchNextPage, // Function to fetch the next page of data
    hasNextPage, // Boolean indicating if there's more data to fetch
    isFetching, // Boolean indicating if data is being fetched
    isFetchingNextPage, // Boolean indicating if the next page is being fetched
    status, // The status of the query (e.g., "pending", "success", "error")
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query], // The unique key for caching and fetching the query, based on the search query
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: query, // Pass the search query to the API
            ...(pageParam ? { cursor: pageParam } : {}), // Pass the pagination cursor if available
          },
        })
        .json<PostsPage>(), // Define the expected response type (PostsPage)
    initialPageParam: null as string | null, // The initial page cursor (null means first page)
    getNextPageParam: (lastPage) => lastPage.nextCursor, // Function to get the cursor for the next page
    gcTime: 0, // Garbage collection time for the query cache (set to 0 for no expiration)
  });

  // Flatten the posts data from all pages into a single array
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // If the query is still loading, show the loading scaffold
  if (status === "pending") {
    return <PostsLoadingScaffold />;
  }

  // If the query is successful but no posts were found for the query, show a message
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No posts found for this query.
      </p>
    );
  }

  // If an error occurred while fetching the data, show an error message
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  // Render the infinite scroll container with the fetched posts
  return (
    <InfiniteScrollContainer
      className="space-y-5" // Spacing between posts
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()} // Fetch next page when the bottom is reached
    >
      {/* Map over the posts and render each as a Post component */}
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {/* Show a loading spinner while the next page is being fetched */}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
