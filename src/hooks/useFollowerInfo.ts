import kyInstance from "@/lib/kyFetchExtension";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/** Custom Hook: useFollowerInfo
 *
 * This hook fetches the follower information for a specific user and returns
 * the result using React Query. It leverages server-side data fetching and caching.
 *
 * Parameters:
 * - `userId`: The ID of the user whose follower information is being fetched.
 * - `initialState`: The initial state of the follower data, useful for SSR or initial page load.
 *
 * Returns:
 * - The result of the `useQuery` hook, which includes data, error, status, etc.
 */

export default function useFollowerInfo(
  userId: string, // ID of the user to fetch follower info for
  initialState: FollowerInfo, // Initial data to populate before fetch completes (useful for SSR)
) {
  // useQuery hook for data fetching and caching
  const query = useQuery({
    queryKey: ["follower-info", userId], // Unique query key that identifies the cache for this request
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(), // Function to fetch follower data from API using ky
    initialData: initialState, // Initial data for query (likely provided for SSR or initial load)
    staleTime: Infinity, // Data is considered "fresh" indefinitely (won't refetch automatically)
  });

  return query; // Return the query result, which contains data, status, error, etc.
}
