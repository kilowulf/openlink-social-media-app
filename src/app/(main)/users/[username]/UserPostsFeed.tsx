"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingScaffold from "@/components/posts/PostsLoadingScaffold";
import kyInstance from "@/lib/kyFetchExtension";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

/** User Post Feed Query: Client side
 * displays post feeds
 *
 */

interface UserPostFeedProps {
  userId: string;
}

export default function UserPostFeed({ userId }: UserPostFeedProps) {
  // infinite loading
  const {
    data,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts-feed", "user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
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
        This user hasn&apos;t posted anything yet
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
      {isFetchingNextPage && <Loader2 className="mx-auto animate-spin" />}
    </InfiniteScrollContainer>
  );
}
