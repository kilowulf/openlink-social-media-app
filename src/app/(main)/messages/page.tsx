import { Metadata } from "next"; // Importing Metadata type from Next.js for setting page metadata
import Chat from "./Chat"; // Importing the Chat component to display chat functionality

/**
 * Page Component:
 *
 * This component serves as the Messages page, where the chat interface is displayed.
 * It includes metadata for SEO and page settings, and renders the `Chat` component,
 * which contains the actual chat interface.
 *
 * Key Features:
 * - Metadata for setting the page title as "Messages".
 * - Renders the `Chat` component to handle messaging functionality.
 */

// Page metadata, setting the browser tab title to "Messages"
export const metadata: Metadata = {
  title: "Messages", // Title of the page as shown in the browser tab
};

// Page Component rendering the Chat interface
export default function Page() {
  return <Chat />; // Renders the Chat component, which contains the messaging interface
}
