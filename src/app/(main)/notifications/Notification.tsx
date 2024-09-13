import UserAvatar from "@/components/UserAvatar"; // Component for displaying user avatars
import { NotificationData } from "@/lib/types"; // Type definition for the structure of a notification
import { cn } from "@/lib/utils"; // Utility function for conditionally applying class names
import { NotificationType } from "@prisma/client"; // Enum for the types of notifications (FOLLOW, COMMENT, LIKE)
import { Heart, MessageCircle, User2 } from "lucide-react"; // Icons used for different notification types
import Link from "next/link"; // Link component for navigation

// Props interface for the Notification component, which expects a `notification` object
interface NotificationProps {
  notification: NotificationData; // Notification data for rendering
}

/**
 * Notification Component:
 *
 * This component renders individual notifications, such as a new follower, a comment on a post, or a liked post.
 * It maps different notification types (FOLLOW, COMMENT, LIKE) to specific messages, icons, and links, and uses
 * those to display the relevant details for each notification. Notifications also link to the relevant post or
 * user profile page.
 */
export default function Notification({ notification }: NotificationProps) {
  // Mapping each notification type (FOLLOW, COMMENT, LIKE) to its respective message, icon, and link
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} followed you`, // Follow message
      icon: <User2 className="size-7 text-primary" />, // Follow icon
      href: `/users/${notification.issuer.username}`, // Link to the user who followed
    },
    COMMENT: {
      message: `${notification.issuer.displayName} commented on your post`, // Comment message
      icon: <MessageCircle className="size-7 fill-primary text-primary" />, // Comment icon
      href: `/posts/${notification.postId}`, // Link to the post where the comment was made
    },
    LIKE: {
      message: `${notification.issuer.displayName} liked your post`, // Like message
      icon: <Heart className="size-7 fill-red-500 text-red-500" />, // Like icon (heart)
      href: `/posts/${notification.postId}`, // Link to the post that was liked
    },
  };

  // Destructure the message, icon, and link based on the notification type
  const { message, icon, href } = notificationTypeMap[notification.type];

  // Render the notification as a clickable link
  return (
    <Link href={href} className="block">
      <article
        className={cn(
          // Base styles for the notification card
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          // Highlight unread notifications with a special background
          !notification.read && "bg-primary/10",
        )}
      >
        {/* Icon associated with the notification type (Follow, Like, or Comment) */}
        <div className="my-1">{icon}</div>

        {/* Main content of the notification (avatar, message, and optional post content) */}
        <div className="space-y-3">
          {/* Display the avatar of the user who triggered the notification */}
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />

          {/* Notification message */}
          <div>
            <span className="font-bold">{notification.issuer.displayName}</span>{" "}
            <span>{message}</span>
          </div>

          {/* If the notification is related to a post, display a snippet of the post content */}
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
