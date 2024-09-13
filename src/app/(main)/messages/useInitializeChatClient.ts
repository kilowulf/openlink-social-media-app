import kyInstance from "@/lib/kyFetchExtension"; // kyInstance for making API requests
import { useEffect, useState } from "react"; // React hooks for managing side effects and state
import { StreamChat } from "stream-chat"; // StreamChat client for handling chat functionality
import { useSession } from "../SessionProvider"; // Custom hook to access the user's session data

/**
 * useInitializeChatClient Hook:
 *
 * This hook initializes the StreamChat client and connects the authenticated user to the chat service.
 * It fetches a user token from the server, connects the user, and manages the lifecycle of the StreamChat client.
 *
 * Key Features:
 * - Initializes and connects the StreamChat client with the authenticated user's info.
 * - Fetches the authentication token via an API call.
 * - Manages the cleanup process when the component is unmounted (disconnects the user from the chat service).
 * - Returns the initialized chat client for use in the component.
 */
export default function useInitializeChatClient() {
  // Access the user's session information (user ID, username, display name, avatar)
  const { user } = useSession();

  // State to hold the StreamChat client instance
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  /**
   * useEffect Hook:
   * - Initializes the StreamChat client when the component mounts.
   * - Fetches the authentication token for the user.
   * - Disconnects the user and cleans up the client when the component unmounts.
   */
  useEffect(() => {
    // Get the StreamChat client instance using the Stream API key from environment variables
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    // Connect the user to the chat service using their information and the authentication token
    client
      .connectUser(
        {
          id: user.id, // User ID
          username: user.username, // Username
          name: user.displayName, // Display name
          image: user.avatarUrl, // Avatar URL
        },
        async () =>
          // Fetch the user's token by making an API request to the /api/get-token endpoint
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>() // Parse the response as JSON
            .then((data) => data.token), // Extract the token from the response
      )
      // Handle any errors during the connection process
      .catch((error) => console.error("Failed to connect user", error))
      // Set the chat client state once the user is successfully connected
      .then(() => setChatClient(client));

    /**
     * Cleanup function:
     * - Disconnects the user from the chat service when the component is unmounted.
     * - Cleans up the chat client instance to prevent memory leaks.
     */
    return () => {
      // Reset the chat client state to null
      setChatClient(null);

      // Disconnect the user from the chat service
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error)) // Handle any errors during disconnection
        .then(() => console.log("Connection closed")); // Log when the connection is successfully closed
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]); // Dependencies: re-run the effect if any user info changes

  // Return the initialized chat client (or null if not connected yet)
  return chatClient;
}
