import { Button } from "@/components/ui/button"; // Importing a styled button component.
import { cn } from "@/lib/utils"; // Utility function for handling conditional class names.
import { Menu } from "lucide-react"; // Importing a menu icon from the Lucide React library.
import {
  Channel, // Stream Chat component for managing a chat channel.
  ChannelHeader, // Component for rendering the header of the chat channel.
  ChannelHeaderProps, // Type definition for the props of ChannelHeader.
  MessageInput, // Component for rendering the message input field.
  MessageList, // Component for rendering the list of messages in the chat.
  Window, // Wrapper component to contain the chat window layout (header, message list, and input).
} from "stream-chat-react";

/**
 * ChatChannel Component:
 *
 * This component manages the layout and rendering of the chat window. It includes the message list,
 * input box, and channel header. It also controls whether the chat sidebar is open or closed based
 * on the `open` prop.
 *
 * Key Features:
 * - Conditionally shows or hides the chat channel based on the `open` prop.
 * - Includes the chat window layout with message input and message list.
 * - Custom header for the chat channel with a button to open the sidebar on smaller screens.
 */

interface ChatChannelProps {
  open: boolean; // Boolean indicating whether the chat channel is open or hidden.
  openSidebar: () => void; // Function to open the chat sidebar (triggered on smaller screens).
}

export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
  return (
    // Conditionally renders the chat channel, hiding it on smaller screens if `open` is false.
    <div className={cn("w-full md:block", !open && "hidden")}>
      <Channel>
        <Window>
          {/* Custom header component for the chat channel */}
          <CustomChannelHeader openSidebar={openSidebar} />
          {/* Component to render the list of messages in the chat */}
          <MessageList />
          {/* Component to render the input field for sending messages */}
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

/**
 * CustomChannelHeader Component:
 *
 * This component extends the default `ChannelHeader` to include a button for opening the chat sidebar
 * on smaller screens. The button is hidden on larger screens (md and up). This custom header ensures
 * the layout works across different device sizes.
 *
 * Key Features:
 * - Displays a menu button for opening the sidebar on smaller screens.
 * - Reuses the default `ChannelHeader` component from Stream Chat.
 */

interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void; // Function to open the chat sidebar.
}

function CustomChannelHeader({
  openSidebar, // Function to open the sidebar when the menu button is clicked.
  ...props // Additional props passed to the ChannelHeader component.
}: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Button to open the sidebar, visible only on smaller screens */}
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" /> {/* Icon for the menu button */}
        </Button>
      </div>
      {/* Default Stream Chat channel header with any additional props */}
      <ChannelHeader {...props} />
    </div>
  );
}
