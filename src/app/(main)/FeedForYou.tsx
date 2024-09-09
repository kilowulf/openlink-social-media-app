"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingScaffold from "@/components/posts/PostsLoadingScaffold";
import kyInstance from "@/lib/kyFetchExtension";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

/** Feed Query: Client side
 * displays post feeds
 *
 */

export default function FeedForYou() {
  // infinite loading
  const {
    data,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  // console.log("query data", query.data);
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // check status of query
  if (status === "pending") {
    return <PostsLoadingScaffold />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-muted-foreground text-center">
        No more posts to show. Come back later for more!
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        Error occurred while loading posts
      </p>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
