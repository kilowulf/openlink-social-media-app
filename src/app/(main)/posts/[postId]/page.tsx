import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

/**
 * Page Component for displaying a single post and associated user information.
 *
 * Main features:
 * - Retrieves and displays a post based on the post ID.
 * - Provides metadata for the page title based on the post content and user information.
 * - If the post author is different from the logged-in user, a "Follow" button is provided.
 * - Uses Suspense for lazy-loading user information.
 *
 * Contingent parts:
 * - `getPost`: Fetches the post data from the database along with user information.
 * - `generateMetadata`: Provides SEO-friendly metadata for the page.
 * - `UserInfoSidebar`: Displays information about the post's author, including a follow button.
 */

interface PageProps {
  params: { postId: string }; // Props containing the post ID
}

// Cache the getPost function to optimize data fetching
const getPost = cache(async (postId: string, loggedInUserId: string) => {
  // Fetch the post based on the post ID and include related data
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getPostDataInclude(loggedInUserId), // Include user and media data in the query
  });

  // If the post is not found, trigger a 404 error
  if (!post) notFound();

  return post; // Return the retrieved post data
});

// Generates metadata for the post page (used in <head> for SEO purposes)
export async function generateMetadata({
  params: { postId },
}: PageProps): Promise<Metadata> {
  const { user } = await validateRequest();

  if (!user) return {}; // If user is not logged in, return an empty metadata object

  const post = await getPost(postId, user.id); // Fetch the post for metadata generation

  // Return metadata with the user's display name and a preview of the post content for the page title
  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
  };
}

// Main component for the post page
export default async function Page({ params: { postId } }: PageProps) {
  const { user } = await validateRequest();

  // If the user is not authorized, display an error message
  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  // Fetch the post data
  const post = await getPost(postId, user.id);

  // Render the post and its related user info
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} /> {/* Display the post */}
      </div>
      {/* Display user information in a sidebar if available */}
      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <UserInfoSidebar user={post.user} />{" "}
          {/* Display post author's user info */}
        </Suspense>
      </div>
    </main>
  );
}

// Component to display user information in the sidebar
interface UserInfoSidebarProps {
  user: UserData; // User data associated with the post
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();

  // If the logged-in user is not available, return nothing
  if (!loggedInUser) return null;

  // Render the user's avatar, bio, and a follow button (if not the logged-in user)
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />{" "}
          {/* User's avatar */}
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user.displayName} {/* User's display name */}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{user.username} {/* User's username */}
            </p>
          </div>
        </Link>
      </UserTooltip>
      {/* User's bio (with hashtag and user mention support via Linkify) */}
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {user.bio}
        </div>
      </Linkify>
      {/* Show follow button if the profile is not the logged-in user's profile */}
      {user.id !== loggedInUser.id && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers, // Follower count
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUser.id, // Check if the logged-in user is following this user
            ),
          }}
        />
      )}
    </div>
  );
}
