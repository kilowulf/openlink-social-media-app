import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import TrendingSideBar from "@/components/TrendingSideBar";
import Linkify from "@/components/Linkify";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import UserPostFeed from "./UserPostsFeed";
import EditProfileButton from "./EditProfileButton";

/** User Profile Page:
 *
 * */

// Interface for page properties, containing `username` parameter from the URL
interface PageProps {
  params: { username: string };
}

// Cache function to retrieve user data from the database based on the username.
// This function uses Prisma to find a user, selecting only the data relevant to the logged-in user.
// `getUserDataSelect` is a utility that defines which user fields to return.
const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username, // Case-insensitive match for the username
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId), // Custom selection of user data
  });

  // If no user is found, trigger a 404 response
  if (!user) notFound();

  return user;
});

// Generates metadata for the page (e.g., the title) based on the user's data.
// Uses `validateRequest` to retrieve the logged-in user and get their session.
export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  // If the user is not logged in, return an empty object (no metadata).
  if (!loggedInUser) return {};

  // Fetch the user's data based on the username from the URL.
  const user = await getUser(username, loggedInUser.id);

  // Set the page title to the user's display name and username.
  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

// The main page component for viewing a user's profile.
// Fetches the logged-in user and the profile data for the user specified in the URL.
export default async function Page({ params: { username } }: PageProps) {
  // Validate the request and retrieve the session information for the logged-in user.
  const { user: loggedInUser } = await validateRequest();

  // If the user is not logged in, show an error message.
  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  // Fetch the profile data for the user whose page is being visited.
  const user = await getUser(username, loggedInUser.id);

  // Main page layout with the user profile, posts, and sidebar.
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        {/* Display the user's profile */}
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        {/* Display the user's posts */}
        <UserPostFeed userId={user.id} />
      </div>
      {/* Sidebar component for displaying trending topics */}
      <TrendingSideBar />
    </main>
  );
}

// Interface for the user profile component's props, which includes the user data and the ID of the logged-in user.
interface UserProfileProps {
  user: UserData; // The data for the user whose profile is being displayed.
  loggedInUserId: string; // The ID of the logged-in user.
}

// Component for rendering the user profile section.
async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  // Generate follower information to check if the logged-in user is following the profile's user.
  const followerInfo: FollowerInfo = {
    followers: user._count.followers, // Total number of followers.
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId, // Check if the logged-in user follows the profile user.
    ),
  };

  // Return the user profile layout with avatar, follow button, and user bio.
  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      {/* User avatar section */}
      <UserAvatar
        avatarUrl={user.avatarUrl} // User's avatar URL
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />

      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            {/* Display the user's display name and username */}
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          {/* Member since date */}
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            {/* Display the number of posts the user has made */}
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            {/* Display the number of followers the user has */}
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>

        {/* Display either the "Edit Profile" button (if viewing own profile) or the "Follow" button */}
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} /> // Show the Edit button if the profile belongs to the logged-in user.
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} /> // Show the Follow button if the profile belongs to someone else.
        )}
      </div>

      {/* Display the user's bio, if available, with clickable links for usernames, hashtags, etc. */}
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio} {/* The user's biography */}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
