/**
 * Page Component:
 *
 * This component represents the Bookmarks page, which displays the user's bookmarked posts alongside a trends sidebar.
 * The page consists of two main sections:
 * 1. **Bookmarks Section** - Displays the user's bookmarked posts using the `Bookmarks` component.
 * 2. **Trends Sidebar** - Renders the `TrendsSidebar` component on the side, showing trending topics.
 *
 * Metadata for the page is also set to display the title "Bookmarks" in the browser tab.
 */

import TrendingSidebar from "@/components/TrendingSideBar"; // Sidebar for trending topics
import { Metadata } from "next"; // Type for Next.js metadata
import BookmarksFeed from "./Bookmarks"; // Component to display the bookmarked posts

// Metadata for the page, setting the title to "Bookmarks"
export const metadata: Metadata = {
  title: "Bookmarks", // The title displayed on the browser tab for the bookmarks page
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      {/* Main content area for the bookmarks */}
      <div className="w-full min-w-0 space-y-5">
        {/* Header section with title */}
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>{" "}
          {/* Title for the bookmarks section */}
        </div>
        {/* Bookmarks component renders the list of bookmarked posts */}
        <BookmarksFeed />
      </div>
      {/* Sidebar displaying trending topics */}
      <TrendingSidebar />
    </main>
  );
}
