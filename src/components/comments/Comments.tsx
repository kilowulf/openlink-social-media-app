/**
 * Comments Component:
 *
 * This component is responsible for displaying and managing the comments section of a post.
 * It leverages infinite scrolling to load comments in batches, fetches the comments using the `useInfiniteQuery` hook,
 * and allows users to submit new comments. It also provides loading states, error handling, and an input field for adding comments.
 *
 * Key Features:
 * - Fetches comments for the post using pagination with `useInfiniteQuery`.
 * - Displays existing comments, allows users to load more if available.
 * - Handles comment input and submission using the `CommentInput` component.
 * - Manages loading, success, and error states for comments fetching.
 */

import kyInstance from "@/lib/kyFetchExtension"; // HTTP client instance for making API calls
import { CommentsPage, PostData } from "@/lib/types"; // Type definitions for comments and post data
import { useInfiniteQuery } from "@tanstack/react-query"; // Hook for infinite scrolling and data fetching
import { Loader2 } from "lucide-react"; // Icon for loading spinner
import { Button } from "../ui/button"; // Button component for UI
import Comment from "./Comment"; // Comment component for rendering individual comments
import CommentInput from "./CommentInput"; // Component for handling comment input and submission

// Props interface for the Comments component
interface CommentsProps {
  post: PostData; // Data for the post associated with the comments
}

// Main Comments component
export default function Comments({ post }: CommentsProps) {
  // Use `useInfiniteQuery` to fetch comments for the post with pagination
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id], // Unique key to cache and track comments for a specific post
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`, // API call to fetch comments for the post
            pageParam ? { searchParams: { cursor: pageParam } } : {}, // Handle pagination with cursor if provided
          )
          .json<CommentsPage>(), // Parse the response as CommentsPage
      initialPageParam: null as string | null, // Initial page parameter (null for the first page)
      getNextPageParam: (firstPage) => firstPage.previousCursor, // Determine the cursor for the next page (previous comments)
      select: (data) => ({
        pages: [...data.pages].reverse(), // Reverse the pages to load comments in the correct order
        pageParams: [...data.pageParams].reverse(), // Reverse pageParams to maintain correct pagination
      }),
    });

  // Flatten the fetched pages into a single array of comments
  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="space-y-3">
      {/* Comment input field */}
      <CommentInput post={post} />
      {/* Button to load previous comments if more are available */}
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching} // Disable button if a fetch operation is in progress
          onClick={() => fetchNextPage()} // Fetch the next page of comments when clicked
        >
          Load previous comments
        </Button>
      )}
      {/* Show loading spinner while comments are being fetched */}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {/* Show message if there are no comments */}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">No comments yet.</p>
      )}
      {/* Show error message if an error occurs while fetching comments */}
      {status === "error" && (
        <p className="text-center text-destructive">
          An error occurred while loading comments.
        </p>
      )}
      {/* Render list of comments */}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} /> // Render each comment using the Comment component
        ))}
      </div>
    </div>
  );
}
