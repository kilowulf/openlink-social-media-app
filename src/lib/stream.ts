import { StreamChat } from "stream-chat"; // Import StreamChat client from Stream API

/**
 * StreamChat Client Initialization:
 *
 * This code initializes a server-side instance of the StreamChat client using the Stream API.
 * It enables interaction with the Stream service for managing real-time messaging and
 * other communication features. The instance is created with both a public key (used
 * for general operations) and a secret key (used for secure server-side actions).
 */

// Create a StreamChat server client instance using public and secret keys
// This client will be used for performing server-side operations with Stream's real-time messaging service
const streamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!, // Public API key for Stream, used for client-side and server-side authentication
  process.env.STREAM_SECRET, // Secret API key for Stream, used exclusively for server-side secure operations
);

export default streamServerClient; // Export the initialized client for use in the application
