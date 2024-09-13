"use client";

/**
 * Post Component:
 *
 * This component displays a single post along with its associated information, such as the author, content, likes, comments, and attachments (media).
 * It includes functionality for users to like, bookmark, comment, and view attachments like images or videos. It also supports toggling comments visibility
 * and contains buttons for interacting with the post.
 *
 * Key Features:
 * - User Avatar: Displays the author's avatar and links to their profile.
 * - Post Content: Shows the text of the post, which can contain mentions and links.
 * - Media Previews: Displays attached media like images or videos.
 * - Like, Comment, and Bookmark buttons: Allows users to interact with the post.
 * - Comments: Toggle to show or hide the comments section.
 */

import { useSession } from "@/app/(main)/SessionProvider"; // Handles user session data
import { PostData } from "@/lib/types"; // TypeScript type for the Post data structure
import { cn, formatRelativeDate } from "@/lib/utils"; // Utility functions: classNames (cn) and date formatting
import { Media } from "@prisma/client"; // Media type from Prisma schema
import { MessageSquare } from "lucide-react"; // Icon for comments button
import Image from "next/image"; // Component for rendering images
import Link from "next/link"; // Component for internal navigation
import { useState } from "react"; // React hook to manage local component state
import Comments from "../comments/Comments"; // Component for rendering post comments
import Linkify from "../Linkify"; // Component to convert links in post content
import UserAvatar from "../UserAvatar"; // Component for rendering user avatar
import UserTooltip from "../UserTooltip"; // Component for displaying user information on hover
import BookmarkButton from "./BookmarkButton"; // Button for bookmarking the post
import LikeButton from "./LikeButton"; // Button for liking the post
import PostMoreButton from "./PostMoreButton"; // Button for additional post options (e.g., edit, delete)

interface PostProps {
  post: PostData; // Post data passed as a prop
}

export default function Post({ post }: PostProps) {
  const { user } = useSession(); // Accessing the current user's session data

  const [showComments, setShowComments] = useState(false); // State for toggling the comments section

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {/* Display user's avatar and username */}
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            {/* Display user's display name and link to their profile */}
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            {/* Display post date and link to post details */}
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {/* More options button (appears only for the post author) */}
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      {/* Display post content with links and mentions */}
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {/* Display attached media (if any) */}
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      {/* Like, Comment, and Bookmark Buttons */}
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          {/* Like button with count */}
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          {/* Comment button to toggle the comments section */}
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        {/* Bookmark button to bookmark the post */}
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
      </div>
      {/* Comments section (toggled) */}
      {showComments && <Comments post={post} />}
    </article>
  );
}

/**
 * MediaPreviews Component:
 * - Displays the media (images, videos) attached to a post.
 */
interface MediaPreviewsProps {
  attachments: Media[]; // List of media attachments
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2", // If more than 1 attachment, display in a grid
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} /> // Render each media attachment
      ))}
    </div>
  );
}

/**
 * MediaPreview Component:
 * - Handles rendering of individual media items (either images or videos).
 */
interface MediaPreviewProps {
  media: Media; // Media object containing details about the attachment
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl" // Display image preview
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl" // Display video preview
        />
      </div>
    );
  }

  // Fallback for unsupported media types
  return <p className="text-destructive">Unsupported media type</p>;
}

/**
 * CommentButton Component:
 * - Button to toggle the comments section for a post.
 */
interface CommentButtonProps {
  post: PostData; // Post data passed as a prop
  onClick: () => void; // Function to handle the comment button click event
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" /> {/* Comment icon */}
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments} {/* Display comment count */}
        <span className="hidden sm:inline">comments</span>{" "}
        {/* Label (hidden on small screens) */}
      </span>
    </button>
  );
}
