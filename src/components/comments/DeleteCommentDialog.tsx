/**
 * DeleteCommentDialog Component:
 *
 * This component renders a confirmation dialog for deleting a comment. It leverages the `useDeleteCommentMutation` hook
 * to handle the deletion operation and provides a user-friendly interface with a confirmation prompt.
 *
 * Key Features:
 * - Shows a confirmation dialog with the option to delete or cancel.
 * - Integrates with the mutation to delete a comment.
 * - Handles loading state during the deletion process and disables buttons accordingly.
 * - Provides user feedback via the dialog and mutation state management.
 */

import { CommentData } from "@/lib/types"; // Type definition for comment data
import LoadingButton from "../LoadingButton"; // Button component that shows loading state
import { Button } from "../ui/button"; // Basic button component from UI library
import {
  Dialog, // Wrapper for the dialog component
  DialogContent, // Content section of the dialog
  DialogDescription, // Descriptive text inside the dialog
  DialogFooter, // Footer section of the dialog with buttons
  DialogHeader, // Header section of the dialog
  DialogTitle, // Title of the dialog
} from "../ui/dialog";
import { useDeleteCommentMutation } from "./mutations"; // Mutation hook for deleting a comment

// Interface for the props of the DeleteCommentDialog component
interface DeleteCommentDialogProps {
  comment: CommentData; // The comment data to be deleted
  open: boolean; // Whether the dialog is open
  onClose: () => void; // Function to close the dialog
}

// The main DeleteCommentDialog component
export default function DeleteCommentDialog({
  comment,
  open,
  onClose,
}: DeleteCommentDialogProps) {
  // Use the delete comment mutation hook to handle the deletion process
  const mutation = useDeleteCommentMutation();

  /**
   * Handles when the dialog open state changes. Closes the dialog if it is
   * not open or if the mutation is not pending.
   *
   * @param {boolean} open - Whether the dialog is open or not.
   */
  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose(); // Close the dialog when not open or mutation isn't in progress
    }
  }

  return (
    // The Dialog component that wraps around the dialog content
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {/* Dialog header with title and description */}
        <DialogHeader>
          <DialogTitle>Delete comment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {/* Dialog footer with delete and cancel buttons */}
        <DialogFooter>
          {/* LoadingButton that triggers the delete mutation */}
          <LoadingButton
            variant="destructive" // Destructive variant for the delete action
            onClick={() => mutation.mutate(comment.id, { onSuccess: onClose })} // Trigger the delete mutation and close dialog on success
            loading={mutation.isPending} // Show loading state while mutation is in progress
          >
            Delete
          </LoadingButton>

          {/* Cancel button to close the dialog without deleting */}
          <Button
            variant="outline" // Outline variant for cancel action
            onClick={onClose} // Close the dialog on click
            disabled={mutation.isPending} // Disable if mutation is in progress
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
