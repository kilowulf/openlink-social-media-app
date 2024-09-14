import { Button } from "@/components/ui/button"; // Importing a custom button component.
import { cn } from "@/lib/utils"; // Utility function for conditional class names.
import { useQueryClient } from "@tanstack/react-query"; // Hook to interact with the React Query cache.
import { MailPlus, X } from "lucide-react"; // Icons for the chat UI (MailPlus for new chat, X for close).
import { useCallback, useEffect, useState } from "react";
import {
  ChannelList, // Component to list available chat channels.
  ChannelPreviewMessenger, // Component to preview chat channels.
  ChannelPreviewUIComponentProps, // Type for the props of ChannelPreviewMessenger.
  useChatContext, // Hook to access the Stream Chat context.
} from "stream-chat-react";
import { useSession } from "../SessionProvider"; // Custom hook to get the user's session data.
import NewChatDialog from "./NewChatDialog"; // Component for creating a new chat.

interface ChatSidebarProps {
  open: boolean; // Boolean to control whether the sidebar is open or closed.
  onClose: () => void; // Function to close the sidebar.
}

/**
 * ChatSidebar Component:
 *
 * This component renders the sidebar that lists chat channels. It allows users to select an existing chat or start a new one.
 * The sidebar is responsive and can be toggled open or closed.
 *
 * Key Features:
 * - Displays a list of chat channels that the user is a member of.
 * - Allows the user to start a new chat via the NewChatDialog component.
 * - Closes the sidebar when a channel is selected or the close button is clicked.
 * - Updates the unread message count when a channel is selected.
 */

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { user } = useSession(); // Get the currently logged-in user from the session.
  const queryClient = useQueryClient(); // Initialize the React Query client.
  const { channel } = useChatContext(); // Access the current chat context (Stream Chat).

  /**
   * Effect Hook:
   * - This hook invalidates the cached query for unread messages when a new chat channel is selected.
   * - It ensures the unread message count stays updated when switching channels.
   */
  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [channel?.id, queryClient]);

  /**
   * ChannelPreviewCustom:
   * - This is a custom component used to render each channel preview.
   * - It sets the active chat channel when a user selects one, and closes the sidebar on smaller screens.
   */
  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose(); // Close the sidebar when a channel is selected.
        }}
      />
    ),
    [onClose], // Re-run the callback when the onClose function changes.
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e md:flex md:w-72", // Sidebar style and width for larger screens (md).
        open ? "flex" : "hidden", // Conditionally render sidebar based on `open` prop.
      )}
    >
      <MenuHeader onClose={onClose} />
      {/* Render the header with the close button and new chat button */}
      <ChannelList
        filters={{
          type: "messaging", // Filter to only show messaging channels.
          members: { $in: [user.id] }, // Only show channels where the user is a member.
        }}
        showChannelSearch // Enable the channel search feature.
        options={{ state: true, presence: true, limit: 8 }} // Limit the number of channels to 8 and show presence.
        sort={{ last_message_at: -1 }} // Sort channels by the most recent message.
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [user.id] } }, // Ensure the search results show channels the user is in.
            },
          },
        }}
        Preview={ChannelPreviewCustom} // Use the custom preview component for rendering channel previews.
      />
    </div>
  );
}

/**
 * MenuHeader Component:
 *
 * This component renders the header for the chat sidebar. It includes a button to close the sidebar and
 * another button to open a dialog for creating a new chat. It also manages the state for showing or hiding the new chat dialog.
 */

interface MenuHeaderProps {
  onClose: () => void; // Function to close the sidebar.
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false); // State to control visibility of the NewChatDialog.

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        {/* Close button for small screens (visible on md:hidden) */}
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" /> {/* X icon to close the sidebar */}
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>{" "}
        {/* Sidebar title */}
        {/* Button to open the NewChatDialog for creating a new chat */}
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />{" "}
          {/* MailPlus icon for starting a new chat */}
        </Button>
      </div>
      {/* Render the NewChatDialog if showNewChatDialog is true */}
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false); // Close the dialog after creating a chat.
            onClose(); // Close the sidebar after creating a chat.
          }}
        />
      )}
    </>
  );
}
