import { PostData } from "@/lib/types";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeletePostMutation } from "./mutations";

/**
 * DeletePostDialog Component:
 *
 * This component is responsible for rendering a confirmation dialog when a user attempts to delete a post.
 * It integrates the delete post functionality using the `useDeletePostMutation` hook and manages the dialog's state.
 *
 * Key Features:
 * - Displays a confirmation dialog before deleting a post.
 * - Calls the `useDeletePostMutation` hook to handle the actual deletion process.
 * - Disables the dialog buttons during the deletion process to prevent duplicate actions.
 */

interface DeletePostDialogProps {
  post: PostData; // The post that is being considered for deletion.
  open: boolean; // A flag to determine if the dialog is open or closed.
  onClose: () => void; // Callback function to close the dialog.
}

export default function DeletePostDialog({
  post,
  open,
  onClose,
}: DeletePostDialogProps) {
  // Initialize the delete post mutation using the custom hook.
  const mutation = useDeletePostMutation();

  /**
   * handleOpenChange:
   *
   * This function is triggered when the dialog's open state changes.
   * It automatically closes the dialog if it's not open or if the delete operation is not pending.
   *
   * @param {boolean} open - Whether the dialog is open or not.
   */
  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose(); // Close the dialog if the deletion is done or canceled.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          {/* Dialog title and description */}
          <DialogTitle>Delete post?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Delete button: Triggers the deletion and shows loading state */}
          <LoadingButton
            variant="destructive"
            onClick={() => mutation.mutate(post.id, { onSuccess: onClose })}
            loading={mutation.isPending} // Show loading state when the mutation is pending.
          >
            Delete
          </LoadingButton>

          {/* Cancel button: Closes the dialog, disabled during deletion */}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending} // Disable button while deletion is in progress.
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
