"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import Link from "next/link";
import { PropsWithChildren } from "react";
import FollowButton from "./FollowButton";
import FollowerCount from "./FollowerCount";
import Linkify from "./Linkify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import UserAvatar from "./UserAvatar";

/**
 * UserTooltip Component:
 * Displays user information inside a tooltip when a user hovers over a component.
 * The tooltip shows user details like avatar, username, bio, and follower count.
 *
 * Props:
 * - `user`: The user whose information is displayed inside the tooltip.
 * - `children`: The content that triggers the tooltip when hovered over.
 */

interface UserTooltipProps extends PropsWithChildren {
  user: UserData; // User data object passed as a prop, representing the user being viewed.
}
export default function UserTooltip({ children, user }: UserTooltipProps) {
  // Access the logged-in user's session data.
  const { user: loggedInUser } = useSession();

  // Set the initial follower state by checking if the logged-in user follows the tooltip's user.
  const followerState: FollowerInfo = {
    followers: user._count.followers, // Number of followers the user has.
    isFollowedByUser: !!user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id, // Check if the logged-in user is following the tooltip user.
    ),
  };

  return (
    <TooltipProvider>
      {" "}
      {/* Provides the tooltip context for nested tooltip components */}
      <Tooltip>
        {/* The component that triggers the tooltip when hovered or focused */}
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        {/* The content displayed inside the tooltip */}
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            {/* User avatar and follow button */}
            <div className="flex items-center justify-between gap-2">
              {/* Clicking on the avatar redirects to the user's profile */}
              <Link href={`/users/${user.username}`}>
                <UserAvatar size={70} avatarUrl={user.avatarUrl} />
              </Link>
              {/* Show the follow button only if the tooltip's user is not the logged-in user */}
              {loggedInUser.id !== user.id && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>

            {/* User display name and username */}
            <div>
              {/* Clicking the username or display name redirects to the user's profile */}
              <Link href={`/users/${user.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName} {/* User's full name */}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>{" "}
                {/* User's username */}
              </Link>
            </div>

            {/* User's bio (if present), processed by Linkify to create clickable hashtags, usernames, or URLs */}
            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}{" "}
                  {/* The user's biography with automatic linkification */}
                </div>
              </Linkify>
            )}

            {/* Displays the follower count */}
            <FollowerCount userId={user.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
