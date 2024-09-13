"use client";

import { Button } from "@/components/ui/button"; // Button component from the UI library
import kyInstance from "@/lib/kyFetchExtension"; // kyInstance for making HTTP requests
import { MessageCountInfo } from "@/lib/types"; // Type definition for message count info
import { useQuery } from "@tanstack/react-query"; // React Query hook for data fetching
import { Mail } from "lucide-react"; // Mail icon from lucide-react
import Link from "next/link"; // Link component for client-side navigation in Next.js

// Interface defining the props for the MessagesButton component
interface MessagesButtonProps {
  initialState: MessageCountInfo; // Initial unread message count passed as a prop
}

/**
 * MessagesButton Component:
 *
 * This component displays a button that links to the user's messages page. It shows the number of unread messages
 * as a badge over the mail icon, which updates at regular intervals. The initial unread count is passed through
 * the `initialState` prop, and real-time data is fetched using React Query.
 *
 * Key Features:
 * - Fetches unread message count and displays it as a badge.
 * - Updates the unread message count every 60 seconds.
 * - Provides a link to the messages page using the Next.js Link component.
 */
export default function MessagesButton({ initialState }: MessagesButtonProps) {
  // useQuery hook to fetch the unread message count from the server
  const { data } = useQuery({
    queryKey: ["unread-messages-count"], // Unique key for caching the query
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(), // Fetches the unread message count from the API
    initialData: initialState, // Uses the initial unread count passed as a prop
    refetchInterval: 60 * 1000, // Refetch the unread count every 60 seconds
  });

  return (
    // Button component that displays the mail icon and unread count badge
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3" // Layout for the button
      title="Messages" // Tooltip for the button
      asChild // Renders the button as a child element
    >
      {/* Link component that navigates to the messages page */}
      <Link href="/messages">
        <div className="relative">
          <Mail /> {/* Mail icon */}
          {/* Conditionally render the unread count badge if there are unread messages */}
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount} {/* Displays the unread message count */}
            </span>
          )}
        </div>
        {/* Display the label "Messages" on large screens */}
        <span className="hidden lg:inline">Messages</span>
      </Link>
    </Button>
  );
}
