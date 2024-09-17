import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import { unstable_cache } from "next/cache";
import { formatNumber } from "@/lib/utils";
import FollowButton from "./FollowButton";
import { getUserDataSelect } from "@/lib/types";
import UserTooltip from "./UserTooltip";

/**
 * TrendingSideBar Component:
 *
 * This component displays the sidebar containing trending projects and recommended users to follow.
 * It uses the `Suspense` component to delay rendering while waiting for the recommended follow data to load.
 *
 * Features:
 * - Displays a loader icon while the component waits for data
 * - Shows trending projects and recommended users to follow
 * - Uses `Suspense` to handle asynchronous rendering of subcomponents
 */
export default function TrendingSideBar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      {/** Delays rendering to give the appearance of syncing/loading */}
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <RecommendedFollow />
        <TrendingProjects />
      </Suspense>
    </div>
  );
}

/**
 * RecommendedFollow Component:
 *
 * Fetches and displays a list of recommended users to follow, excluding those that the current user already follows.
 *
 * Key Features:
 * - Authenticates the current user and fetches users not being followed
 * - Displays a list of users with their profile avatars and a follow button
 * - Limits the list to 5 users
 */
async function RecommendedFollow() {
  // Validate the user making the request
  const { user } = await validateRequest();

  // If no user is authenticated, return null (no recommendations shown)
  if (!user) return null;

  // Fetch recommended users to follow (those the user is not already following)
  const recommendedFollow = await prisma.user.findMany({
    where: {
      NOT: { id: user.id }, // Exclude the current user
      followers: {
        none: { followerId: user.id }, // Exclude users already followed by the current user
      },
    },
    select: getUserDataSelect(user.id), // Select relevant user data
    take: 5, // Limit to 5 recommendations
  });

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Follow Recommendations</div>
      {recommendedFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <UserTooltip user={user}>
            <Link
              href={`/users/${user.username}`}
              className="flex items-center gap-3"
            >
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.displayName}
                </p>
                <p className="line-clamp-1 break-all text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </Link>
          </UserTooltip>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === user.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * getTrendingProjects Function:
 *
 * This function retrieves trending project hashtags from the database. It uses a server-side cache to store the
 * trending results and reduce database load. The cache expires after 3 hours.
 *
 * Key Features:
 * - Extracts hashtags from post content
 * - Counts the number of posts for each hashtag
 * - Caches the results for 3 hours using `unstable_cache`
 */
const getTrendingProjects = unstable_cache(
  async () => {
    // Run a raw SQL query to find trending hashtags based on the content of posts
    const trendingResults = await prisma.$queryRaw<
      { hashtag: string; count: bigint }[]
    >`
    SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
    FROM posts
    GROUP BY (hashtag)
    ORDER BY count DESC, hashtag ASC 
    LIMIT 5`;

    // Convert the result count from BigInt to a regular number
    return trendingResults.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_projects"], // Cache key
  {
    revalidate: 3 * 60 * 60, // Revalidate the cache every 3 hours (in seconds)
  },
);

/**
 * TrendingProjects Component:
 *
 * This component fetches and displays the top trending project hashtags. It lists the hashtags
 * along with the number of posts for each hashtag. Users can click on a hashtag to view all posts related to it.
 */
async function TrendingProjects() {
  const trendingProjects = await getTrendingProjects();

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-wl font-bold">Trending Projects</div>
      {trendingProjects.map(({ hashtag, count }) => {
        // Extract the project title from the hashtag
        const title = hashtag.split("#")[1];
        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
