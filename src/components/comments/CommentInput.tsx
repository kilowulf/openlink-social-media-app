/**
 * CommentInput Component:
 *
 * This component provides an input field for users to submit comments on a post. It handles user input, form submission,
 * and displays a loading spinner when the comment is being submitted.
 *
 * Key Features:
 * - Allows users to write and submit comments.
 * - Disables submission if the input is empty or while the comment is being posted.
 * - Provides visual feedback with a loading spinner during submission.
 */

import { PostData } from "@/lib/types"; // Type definition for the post data
import { Loader2, SendHorizonal } from "lucide-react"; // Icons for loading spinner and send button
import { useState } from "react"; // React hook for managing local state
import { Button } from "../ui/button"; // Button component from the UI library
import { Input } from "../ui/input"; // Input component for text input
import { useSubmitCommentMutation } from "./mutations"; // Mutation hook for submitting a comment

// Interface defining the props expected by the CommentInput component
interface CommentInputProps {
  post: PostData; // The post data for which the comment is being written
}

// Main CommentInput component for writing and submitting comments
export default function CommentInput({ post }: CommentInputProps) {
  // Local state to hold the comment input text
  const [input, setInput] = useState("");

  // Hook to handle comment submission using the post ID
  const mutation = useSubmitCommentMutation(post.id);

  /**
   * Handles the comment submission.
   * - Prevents the default form submission behavior.
   * - Calls the mutation to submit the comment if the input is not empty.
   * - Clears the input field upon successful submission.
   *
   * @param {React.FormEvent} e - The form submit event.
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevents the form from performing a default submission

    if (!input) return; // Do not submit if the input is empty

    // Mutate (submit the comment), resetting the input on success
    mutation.mutate(
      {
        post, // The post for which the comment is being submitted
        content: input, // The content of the comment
      },
      {
        onSuccess: () => setInput(""), // Clear the input field after successful submission
      },
    );
  }

  return (
    // Form element with submit handling and styling for the comment input
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      {/* Input field for the comment */}
      <Input
        placeholder="Write a comment..." // Placeholder text
        value={input} // Bind the input state to the value of the input field
        onChange={(e) => setInput(e.target.value)} // Update input state on change
        autoFocus // Automatically focus the input when rendered
      />

      {/* Submit button with disabled state during loading or empty input */}
      <Button
        type="submit"
        variant="ghost" // Button variant
        size="icon" // Button size for icon
        disabled={!input.trim() || mutation.isPending} // Disable if no input or pending mutation
      >
        {/* Show the send icon if not pending, otherwise show the loading spinner */}
        {!mutation.isPending ? (
          <SendHorizonal /> // Icon to send the comment
        ) : (
          <Loader2 className="animate-spin" /> // Loading spinner during submission
        )}
      </Button>
    </form>
  );
}
