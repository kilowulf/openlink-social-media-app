import { validateRequest } from "@/auth"; // Validates the user session
import { Button } from "@/components/ui/button"; // Button component from the UI library
import prisma from "@/lib/prisma"; // Prisma client for interacting with the database
import streamServerClient from "@/lib/stream"; // Stream server client for managing real-time messaging
import { Bookmark, Home } from "lucide-react"; // Icons from lucide-react for menu items
import Link from "next/link"; // Next.js Link component for client-side navigation
import MessagesButton from "./MessagesButton"; // Component for displaying the messages button with unread count
import NotificationsButton from "./NotificationsButton"; // Component for displaying the notifications button with unread count

// Interface defining optional className prop for the MenuBar component
interface MenuBarProps {
  className?: string; // Optional className to style the menu bar externally
}

/**
 * MenuBar Component:
 *
 * This component displays a navigation menu bar with links to home, bookmarks, notifications, and messages.
 * It also fetches and displays the unread notification and message counts. The menu is only displayed if the
 * user is authenticated.
 *
 * Key Features:
 * - Shows buttons for home, bookmarks, notifications, and messages.
 * - Fetches unread notification and message counts to display badges.
 * - Uses `validateRequest` to ensure only logged-in users can see the menu.
 * - Displays different button labels depending on screen size.
 */
export default async function MenuBar({ className }: MenuBarProps) {
  // Validate the user session and get the logged-in user's details
  const { user } = await validateRequest();

  // If no user is authenticated, do not render the menu bar
  if (!user) return null;

  // Fetch unread notification and message counts in parallel using Promise.all
  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id, // Fetch unread notifications for the logged-in user
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count, // Fetch unread message count from Stream API
  ]);

  return (
    // Main container for the menu bar with optional external styling via className prop
    <div className={className}>
      {/* Button for navigating to the home page */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3" // Layout for the button
        title="Home" // Tooltip for the button
        asChild // Ensures the button is rendered as a child element
      >
        {/* Link component to navigate to the home page */}
        <Link href="/">
          <Home /> {/* Home icon */}
          <span className="hidden lg:inline">Home</span>{" "}
          {/* Label displayed only on large screens */}
        </Link>
      </Button>

      {/* Notifications button with unread count passed as initial state */}
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }} // Pass initial unread notifications count
      />

      {/* Messages button with unread count passed as initial state */}
      <MessagesButton
        initialState={{ unreadCount: unreadMessagesCount }} // Pass initial unread messages count
      />

      {/* Button for navigating to the bookmarks page */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3" // Layout for the button
        title="Bookmarks" // Tooltip for the button
        asChild // Ensures the button is rendered as a child element
      >
        {/* Link component to navigate to the bookmarks page */}
        <Link href="/bookmarks">
          <Bookmark /> {/* Bookmark icon */}
          <span className="hidden lg:inline">Bookmarks</span>{" "}
          {/* Label displayed only on large screens */}
        </Link>
      </Button>
    </div>
  );
}
