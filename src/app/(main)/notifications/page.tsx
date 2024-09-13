import { Metadata } from "next"; // Type definition for handling metadata in Next.js
import Notifications from "./Notifications"; // Component responsible for rendering notifications
import TrendingSideBar from "@/components/TrendingSideBar"; // Component that shows trending topics on the sidebar

/**
 * Metadata for the notifications page:
 *
 * This defines the metadata for the page, setting the title that appears in the browser tab
 * when the notifications page is accessed.
 */
export const metadata: Metadata = {
  title: "Notifications", // Sets the page title to "Notifications"
};

/**
 * Page Component:
 *
 * This component represents the layout for the Notifications page. It consists of two main sections:
 * 1. Notifications list: This is rendered using the `Notifications` component.
 * 2. Trends Sidebar: Shows trending topics using the `TrendsSidebar` component.
 */
export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      {/* Main content area for the notifications */}
      <div className="w-full min-w-0 space-y-5">
        {/* Container for the page header */}
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Notifications</h1>{" "}
          {/* Title for the notifications section */}
        </div>
        {/* Component to display the user's notifications */}
        <Notifications />
      </div>
      {/* Sidebar displaying trending topics */}
      <TrendingSideBar />
    </main>
  );
}
