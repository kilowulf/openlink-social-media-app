"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
/** FollowerCount Component:
 * This component displays the number of followers for a given user.
 * It uses cached follower data and updates when new data is available.
 *
 * Props:
 * - `userId`: The ID of the user whose follower count will be displayed.
 * - `initialState`: Initial follower data (useful for SSR or initial rendering).
 */

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  // Custom hook to fetch and cache follower information.
  // This retrieves whether the user is following the target user and the number of followers.
  const { data } = useFollowerInfo(userId, initialState);

  return (
    // Display the follower count. If data is not yet available, fallback to showing the initial count.
    <span>
      Followers:{" "}
      {/* The follower count is displayed using the formatted number (e.g., "1,000" instead of "1000") */}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}
