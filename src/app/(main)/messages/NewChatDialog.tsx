import LoadingButton from "@/components/LoadingButton"; // Custom loading button for UI feedback.
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // UI components for creating a modal dialog.
import { useToast } from "@/components/ui/use-toast"; // Hook for displaying toast notifications.
import UserAvatar from "@/components/UserAvatar"; // Component to display user avatars.
import useDebounce from "@/hooks/useDebounce"; // Custom hook for debouncing inputs.
import { useMutation, useQuery } from "@tanstack/react-query"; // React Query hooks for data fetching and mutations.
import { Check, Loader2, SearchIcon, X } from "lucide-react"; // Icons for UI elements.
import { useState } from "react"; // React state management.
import { UserResponse } from "stream-chat"; // Type for a user's response from Stream Chat.
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react"; // Stream Chat context hooks and types.
import { useSession } from "../SessionProvider"; // Custom hook for managing user sessions.

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void; // Callback to handle when the dialog is opened or closed.
  onChatCreated: () => void; // Callback when a new chat is successfully created.
}

/**
 * NewChatDialog Component:
 *
 * This component renders a dialog for creating a new chat. It allows users to search for other users
 * and select them to start a new conversation. The chat is created by interacting with the Stream Chat API.
 *
 * Key Features:
 * - User search with debounced input for efficient querying.
 * - Displays search results with user avatars and names.
 * - Allows selection of multiple users for group chats.
 * - Submits the selected users to create a new chat channel.
 */
export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const { client, setActiveChannel } = useChatContext(); // Access the Stream Chat client and setActiveChannel function.
  const { toast } = useToast(); // Hook for displaying toast notifications.
  const { user: loggedInUser } = useSession(); // Get the currently logged-in user's session.

  // State to hold the search input and debounce it for more efficient querying.
  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput); // Debounce the search input.

  // State to hold the list of selected users for the new chat.
  const [selectedUsers, setSelectedUsers] = useState<
    UserResponse<DefaultStreamChatGenerics>[]
  >([]);

  /**
   * useQuery Hook:
   *
   * This query fetches users from the Stream Chat API based on the debounced search input.
   * It excludes the logged-in user and any admin users from the search results.
   */
  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () =>
      client.queryUsers(
        {
          id: { $ne: loggedInUser.id }, // $ne: -not equal. Exclude the logged-in user from the search results.
          role: { $ne: "admin" }, // Exclude admin users from the search results.
          ...(searchInputDebounced
            ? {
                $or: [
                  { name: { $autocomplete: searchInputDebounced } }, // Search by name.
                  { username: { $autocomplete: searchInputDebounced } }, // Search by username.
                ],
              }
            : {}),
        },
        { name: 1, username: 1 }, // Sort the results by name and username.
        { limit: 15 }, // Limit the search results to 15 users.
      ),
  });

  /**
   * useMutation Hook:
   *
   * This mutation creates a new chat channel by sending the selected users to the Stream Chat API.
   * On success, it activates the new channel and triggers the onChatCreated callback.
   */
  const mutation = useMutation({
    mutationFn: async () => {
      // Create a new channel with the selected users.
      const channel = client.channel("messaging", {
        members: [loggedInUser.id, ...selectedUsers.map((u) => u.id)], // Add selected users to the chat.
        name:
          selectedUsers.length > 1
            ? loggedInUser.displayName +
              ", " +
              selectedUsers.map((u) => u.name).join(", ") // Generate a name for group chats.
            : undefined, // No name for one-on-one chats.
      });
      await channel.create(); // Create the channel via Stream Chat API.
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel); // Set the new channel as active.
      onChatCreated(); // Trigger the callback when chat is created.
    },
    onError(error) {
      console.error("Error starting chat", error);
      toast({
        variant: "destructive",
        description: "Error starting chat. Please try again.", // Show error toast on failure.
      });
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      {/* Dialog container for creating a new chat */}
      <DialogContent className="bg-card p-0">
        {/* Dialog content with padding and background */}
        <DialogHeader className="px-6 pt-6">
          {/* Dialog header with padding */}
          <DialogTitle>New chat</DialogTitle> {/* Title of the dialog */}
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            {/* Search input field to search for users */}
            <input
              placeholder="Search users..."
              className="h-12 w-full pe-4 ps-14 focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} // Update search input on change.
            />
          </div>
          {/* Display selected users for the new chat */}
          {!!selectedUsers.length && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUsers.map((user) => (
                <SelectedUserTag
                  key={user.id}
                  user={user}
                  onRemove={() => {
                    setSelectedUsers(
                      (prev) => prev.filter((u) => u.id !== user.id), // Remove user from selected list.
                    );
                  }}
                />
              ))}
            </div>
          )}
          <hr />
          <div className="h-96 overflow-y-auto">
            {/* Display user search results */}
            {isSuccess &&
              data.users.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  selected={selectedUsers.some((u) => u.id === user.id)}
                  onClick={() => {
                    setSelectedUsers((prev) =>
                      prev.some((u) => u.id === user.id)
                        ? prev.filter((u) => u.id !== user.id) // Toggle user selection.
                        : [...prev, user],
                    );
                  }}
                />
              ))}
            {/* Display message if no users are found */}
            {isSuccess && !data.users.length && (
              <p className="my-3 text-center text-muted-foreground">
                No users found. Try a different name.
              </p>
            )}
            {/* Display loader while fetching users */}
            {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
            {/* Display error message if the user search fails */}
            {isError && (
              <p className="my-3 text-center text-destructive">
                An error occurred while loading users.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          {" "}
          {/* Dialog footer with padding */}
          <LoadingButton
            disabled={!selectedUsers.length} // Disable button if no users are selected.
            loading={mutation.isPending} // Show loading state while mutation is in progress.
            onClick={() => mutation.mutate()} // Trigger mutation on button click.
          >
            Start chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * UserResult Component:
 *
 * This component renders a single user result in the search results. It displays the user's avatar, name, and username.
 * When clicked, it toggles the user as selected or unselected for the chat.
 */

interface UserResultProps {
  user: UserResponse<DefaultStreamChatGenerics>; // The user data from Stream Chat.
  selected: boolean; // Whether the user is selected for the chat.
  onClick: () => void; // Function to toggle user selection.
}

function UserResult({ user, selected, onClick }: UserResultProps) {
  return (
    <button
      className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50"
      onClick={onClick} // Toggle user selection on click.
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={user.image} /> {/* User avatar */}
        <div className="flex flex-col text-start">
          <p className="font-bold">{user.name}</p> {/* User name */}
          <p className="text-muted-foreground">@{user.username}</p>{" "}
          {/* Username */}
        </div>
      </div>
      {selected && <Check className="size-5 text-green-500" />}{" "}
      {/* Show checkmark if user is selected */}
    </button>
  );
}

/**
 * SelectedUserTag Component:
 *
 * This component displays a selected user in the "selected users" list with an option to remove them.
 */

interface SelectedUserTagProps {
  user: UserResponse<DefaultStreamChatGenerics>; // The user data from Stream Chat.
  onRemove: () => void; // Function to remove the user from the selected list.
}

function SelectedUserTag({ user, onRemove }: SelectedUserTagProps) {
  return (
    <button
      onClick={onRemove} // Remove user from selected list on click.
      className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
    >
      <UserAvatar avatarUrl={user.image} size={24} /> {/* User avatar */}
      <p className="font-bold">{user.name}</p> {/* User name */}
      <X className="mx-2 size-5 text-muted-foreground" />{" "}
      {/* Close icon to remove user */}
    </button>
  );
}
