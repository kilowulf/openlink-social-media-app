"use client";

import kyInstance from "@/lib/kyFetchExtension";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import Link from "next/link";
import { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";

/** UserLinkWithTooltip Component:
 * This component creates a link to a user's profile with a tooltip showing additional information.
 * It fetches the user data based on the username, and if available, wraps the username with a tooltip.
 *
 * Props:
 * - `username`: The username of the user to display.
 * - `children`: The content (text) to be wrapped with the link and tooltip.
 */

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

export default function UserLinkWithTooltip({
  children,
  username,
}: UserLinkWithTooltipProps) {
  // React Query's `useQuery` hook to fetch user data based on the username.
  const { data } = useQuery({
    queryKey: ["user-data", username], // The cache key for this query, ensuring it's unique per username.
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(), // Fetch the user data from the API endpoint.
    retry(failureCount, error) {
      // Retry logic to handle failed requests
      if (error instanceof HTTPError && error.response.status === 404) {
        // If the request fails with a 404 error (user not found), don't retry.
        return false;
      }
      // Retry up to 3 times for other types of failures.
      return failureCount < 3;
    },
    staleTime: Infinity, // This sets the data as "fresh" indefinitely, so the query won't refetch unless manually invalidated.
  });

  // If no data is available yet (e.g., the query is still loading or user is not found), render a simple link.
  if (!data) {
    return (
      <Link
        href={`/users/${username}`} 
        className="text-primary hover:underline"
      >
        {children}{" "}
        {/* Displays the content (e.g., the username) inside the link */}
      </Link>
    );
  }

  // If the user data is available, wrap the link in a tooltip showing user info.
  return (
    <UserTooltip user={data}>
      {" "}
      {/* UserTooltip component displays additional info about the user in a tooltip */}
      <Link
        href={`/users/${username}`} // Next.js Link to the user's profile.
        className="text-primary hover:underline" // Styling for the link.
      >
        {children}{" "}
        {/* Displays the content (e.g., the username) inside the link */}
      </Link>
    </UserTooltip>
  );
}
