/**
 * Comment Component:
 *
 * This component is responsible for rendering a single comment in a post's comment section.
 * It includes the user's avatar, username, the time since the comment was posted, and the comment content.
 * If the logged-in user is the author of the comment, additional options (like deleting the comment) are available.
 *
 * Key Features:
 * - Displays the commenter's avatar, username, and the relative time since the comment was created.
 * - If the logged-in user is the comment author, shows the `CommentMoreButton` for additional actions (e.g., delete).
 * - User interactions like hovering over the username or avatar trigger tooltips with more user information.
 */

import { useSession } from "@/app/(main)/SessionProvider"; // Custom hook to get session data for the logged-in user
import { CommentData } from "@/lib/types"; // Type definition for comment data
import { formatRelativeDate } from "@/lib/utils"; // Utility function to format comment date
import Link from "next/link"; // Next.js component for client-side navigation
import UserAvatar from "../UserAvatar"; // Component for rendering user avatars
import UserTooltip from "../UserTooltip"; // Component for displaying user tooltips on hover
import CommentMoreButton from "./CommentMoreButton"; // Component to handle additional comment actions (e.g., delete)

// Props interface for the Comment component
interface CommentProps {
  comment: CommentData; // The comment data to display
}

// Main Comment component
export default function Comment({ comment }: CommentProps) {
  // Retrieve the current logged-in user from the session
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      {/* User avatar displayed on larger screens with a tooltip */}
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          {/* Link to the commenter's profile page */}
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />{" "}
            {/* Display user's avatar */}
          </Link>
        </UserTooltip>
      </span>
      <div>
        {/* User's display name and comment creation time */}
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            {/* Link to the user's profile, with an underline on hover */}
            <Link
              href={`/users/${comment.user.username}`}
              className="font-medium hover:underline"
            >
              {comment.user.displayName} {/* Display the user's display name */}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}{" "}
            {/* Relative date for when the comment was posted */}
          </span>
        </div>
        {/* Comment content */}
        <div>{comment.content}</div>
      </div>
      {/* Show the CommentMoreButton for additional options (like delete) if the logged-in user is the comment author */}
      {comment.user.id === user.id && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100" // Button appears on hover
        />
      )}
    </div>
  );
}
