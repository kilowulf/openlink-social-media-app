import { Prisma } from "@prisma/client";

/**
 * `getUserDataSelect`:
 * Returns the fields to select when querying a user's data. The selection is personalized based on the logged-in user,
 * particularly for checking if the logged-in user is following the target user.
 *
 * @param loggedInUserId - ID of the currently logged-in user
 * @returns Prisma selection object to be used in `findUnique`, `findMany`, etc.
 */
export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true, // User ID
    username: true, // Username
    displayName: true, // User's display name
    avatarUrl: true, // User's avatar URL
    bio: true, // User bio
    createdAt: true, // Account creation date
    followers: {
      where: {
        followerId: loggedInUserId, // Only include if the logged-in user is a follower
      },
      select: {
        followerId: true, // Select the follower ID to check if the user is followed
      },
    },
    _count: {
      select: {
        posts: true, // Total number of posts by the user
        followers: true, // Total number of followers
      },
    },
  } satisfies Prisma.UserSelect;
}

/** Type for user data retrieved based on the fields selected by `getUserDataSelect` */
export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

/**
 * `getPostDataInclude`:
 * Returns the fields to include when querying post data. This includes the user information, attachments, likes, and bookmark status,
 * all personalized to the logged-in user.
 *
 * @param loggedInUserId - ID of the currently logged-in user
 * @returns Prisma inclusion object to be used in post queries
 */
export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId), // Include user details with follower check
    },
    attachments: true, // Include attachments associated with the post
    likes: {
      where: {
        userId: loggedInUserId, // Check if the logged-in user liked the post
      },
      select: {
        userId: true, // Select the user ID to verify if the post is liked
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId, // Check if the post is bookmarked by the logged-in user
      },
      select: {
        userId: true, // Select the user ID to verify bookmark status
      },
    },
    _count: {
      select: {
        likes: true, // Total number of likes on the post
        comments: true, // Total number of comments on the post
      },
    },
  } satisfies Prisma.PostInclude;
}

/** Type for post data retrieved based on the fields included by `getPostDataInclude` */
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

/** Interface for paginated posts data, used for infinite scrolling or pagination */
export interface PostsPage {
  posts: PostData[]; // Array of post data
  nextCursor: string | null; // Cursor for fetching the next page of posts, if any
}

/**
 * `getCommentDataInclude`:
 * Returns the fields to include when querying comment data. This includes the user information.
 *
 * @param loggedInUserId - ID of the currently logged-in user
 * @returns Prisma inclusion object to be used in comment queries
 */
export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId), // Include user details for the comment
    },
  } satisfies Prisma.CommentInclude;
}

/** Type for comment data retrieved based on the fields included by `getCommentDataInclude` */
export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

/** Interface for paginated comments data, used for infinite scrolling or pagination */
export interface CommentsPage {
  comments: CommentData[]; // Array of comment data
  previousCursor: string | null; // Cursor for fetching the previous page of comments, if any
}

/**
 * `notificationsInclude`:
 * Defines the fields to include when querying notifications, such as the issuer (user who triggered the notification) and the post.
 */
export const notificationsInclude = {
  issuer: {
    select: {
      username: true, // Username of the notification issuer
      displayName: true, // Display name of the notification issuer
      avatarUrl: true, // Avatar URL of the notification issuer
    },
  },
  post: {
    select: {
      content: true, // Post content associated with the notification
    },
  },
} satisfies Prisma.NotificationInclude;

/** Type for notification data retrieved based on the fields included by `notificationsInclude` */
export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

/** Interface for paginated notifications data, used for infinite scrolling or pagination */
export interface NotificationsPage {
  notifications: NotificationData[]; // Array of notification data
  nextCursor: string | null; // Cursor for fetching the next page of notifications, if any
}

/** Interface representing basic follower information */
export interface FollowerInfo {
  followers: number; // Total number of followers
  isFollowedByUser: boolean; // Whether the logged-in user follows the target user
}

/** Interface representing like information */
export interface LikeInfo {
  likes: number; // Total number of likes on a post
  isLikedByUser: boolean; // Whether the logged-in user has liked the post
}

/** Interface representing bookmark information */
export interface BookmarkInfo {
  isBookmarkedByUser: boolean; // Whether the post is bookmarked by the logged-in user
}

/** Interface representing unread notification count information */
export interface NotificationCountInfo {
  unreadCount: number; // Total number of unread notifications for the logged-in user
}

/** Interface representing unread message count information */
export interface MessageCountInfo {
  unreadCount: number; // Total number of unread messages for the logged-in user
}
