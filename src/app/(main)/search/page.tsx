import { Metadata } from "next";
import SearchResults from "./SearchResults";
import TrendingSideBar from "@/components/TrendingSideBar";

// Interface that defines the structure of the props for this page component
interface PageProps {
  searchParams: { q: string }; // Search query parameter passed to the page component
}

/**
 * Generates metadata (e.g., page title) based on the search query.
 *
 * @param searchParams - Object containing the search query string "q".
 * @returns Metadata object for SEO, dynamically generating the page title with the query string.
 */
export function generateMetadata({ searchParams: { q } }: PageProps): Metadata {
  return {
    title: `Search results for "${q}"`, // Set page title as "Search results for <query>"
  };
}

/**
 * Page component that displays search results based on a query string.
 *
 * This component is responsible for rendering the search results and providing additional context with a sidebar
 * displaying trending topics. It uses dynamic metadata generation to tailor the page title based on the user's query.
 *
 * @param searchParams - Object containing the query string "q" that is used to fetch and display relevant search results.
 */
export default function Page({ searchParams: { q } }: PageProps) {
  return (
    <main className="flex w-full min-w-0 gap-5">
      {/* Main content section */}
      <div className="w-full min-w-0 space-y-5">
        {/* Header section displaying the search query */}
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{q}&quot; {/* Display the search query */}
          </h1>
        </div>
        {/* Component that fetches and displays search results */}
        <SearchResults query={q} />
      </div>
      {/* Sidebar showing trends */}
      <TrendingSideBar />
    </main>
  );
}
