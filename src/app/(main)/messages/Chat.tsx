"use client"; // This directive ensures the component is executed on the client side.

import { Loader2 } from "lucide-react"; // Importing Loader2 icon for loading spinner.
import { useTheme } from "next-themes"; // Importing theme management hook for handling light/dark mode.
import { useState } from "react"; // Importing useState hook for managing component state.
import { Chat as StreamChat } from "stream-chat-react"; // Importing Chat component from the Stream Chat library.
import ChatChannel from "./ChatChannel"; // Importing ChatChannel component to display chat messages.
import ChatSidebar from "./ChatSideBar"; // Importing ChatSidebar component to display the list of conversations.
import useInitializeChatClient from "./useInitializeChatClient"; // Importing custom hook to initialize the chat client.

/**
 * Chat Component:
 *
 * This component manages the chat interface using the Stream Chat SDK. It displays a chat sidebar for
 * conversations and a chat channel for messages. The component handles theme switching (light/dark mode)
 * and shows a loading spinner while the chat client is being initialized.
 *
 * Key Features:
 * - Initializes chat client using `useInitializeChatClient`.
 * - Integrates theme switching using `useTheme` from Next.js.
 * - Renders a chat interface with a sidebar and chat channel.
 * - Displays a loading spinner while the chat client is being initialized.
 */

export default function Chat() {
  // Initializes the chat client using the custom hook.
  const chatClient = useInitializeChatClient();

  // Retrieves the current theme (light or dark) using Next.js theme management.
  const { resolvedTheme } = useTheme();

  // State to manage whether the chat sidebar is open or closed.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If the chat client has not yet been initialized, display a loading spinner.
  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }

  // Renders the chat interface once the chat client is initialized.
  return (
    <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      {/* Main chat layout that spans the full width */}
      <div className="absolute bottom-0 top-0 flex w-full">
        <StreamChat
          client={chatClient} // Passes the initialized chat client to the Stream Chat component.
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark" // Applies dark theme for chat if the current theme is dark.
              : "str-chat__theme-light" // Applies light theme for chat if the current theme is light.
          }
        >
          {/* Chat Sidebar for viewing conversations */}
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)} // Closes the sidebar.
          />
          {/* Chat Channel for viewing and sending messages */}
          <ChatChannel
            open={!sidebarOpen} // Opens the chat channel when the sidebar is closed.
            openSidebar={() => setSidebarOpen(true)} // Opens the sidebar when triggered.
          />
        </StreamChat>
      </div>
    </main>
  );
}
