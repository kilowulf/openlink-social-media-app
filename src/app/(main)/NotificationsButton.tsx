"use client";

import { Button } from "@/components/ui/button"; // Button component from UI library
import kyInstance from "@/lib/kyFetchExtension"; // HTTP client for making API requests
import { NotificationCountInfo } from "@/lib/types"; // Type for notification count information
import { useQuery } from "@tanstack/react-query"; // React Query hook for fetching data
import { Bell } from "lucide-react"; // Bell icon from lucide-react icon library
import Link from "next/link"; // Next.js link component for client-side navigation

// Interface for component props, expecting the initial state of notification count
interface NotificationsButtonProps {
  initialState: NotificationCountInfo; // Initial count of unread notifications
}

/**
 * NotificationsButton Component:
 *
 * This component displays a button that links to the notifications page. It fetches the count of unread notifications
 * and displays the count next to a bell icon. The count is refetched every minute to stay up-to-date.
 *
 * Key Features:
 * - Displays the unread notification count fetched from the server.
 * - Updates the unread count every 60 seconds (using React Query's `refetchInterval`).
 * - Shows a bell icon with a badge if there are unread notifications.
 * - Navigates to the notifications page when clicked.
 */
export default function NotificationsButton({
  initialState,
}: NotificationsButtonProps) {
  // Fetches the unread notification count using React Query
  const { data } = useQuery({
    queryKey: ["unread-notification-count"], // Unique key to identify this query
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count") // API call to get unread notification count
        .json<NotificationCountInfo>(), // Parses the JSON response into NotificationCountInfo type
    initialData: initialState, // Initial unread count passed as a prop (for faster render)
    refetchInterval: 60 * 1000, // Refetch unread count every 60 seconds to keep the count up-to-date
  });

  return (
    // Button styled as a ghost button and wrapping the link to notifications
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3" // Styling for layout and spacing
      title="Notifications" // Tooltip text when hovering over the button
      asChild // Ensures the button is rendered as a child element
    >
      {/* Link component for navigation to the notifications page */}
      <Link href="/notifications">
        <div className="relative">
          {" "}
          {/* Relative positioning for the notification badge */}
          <Bell /> {/* Bell icon for notifications */}
          {/* Display notification count as a badge only if there are unread notifications */}
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount} {/* Number of unread notifications */}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Notifications</span>{" "}
        {/* Text label displayed only on large screens */}
      </Link>
    </Button>
  );
}
