/**
 * CommentMoreButton Component:
 *
 * This component provides a dropdown menu for additional actions on a comment, such as deleting it.
 * It uses a dropdown menu from the UI library, and when the "Delete" option is selected, a dialog is triggered
 * to confirm the deletion of the comment. The component manages the state of the delete dialog and provides
 * a smooth user experience by handling dialog opening and closing.
 *
 * Key Features:
 * - Dropdown menu with options (currently only "Delete" action).
 * - Opens a confirmation dialog before allowing comment deletion.
 * - Uses the DeleteCommentDialog component to handle the actual deletion process.
 */

import { CommentData } from "@/lib/types"; // Type definition for the comment data
import { MoreHorizontal, Trash2 } from "lucide-react"; // Icons for the "more" button and the "delete" option
import { useState } from "react"; // React hook for managing local state
import { Button } from "../ui/button"; // Button component from the UI library
import {
  DropdownMenu, // Dropdown container
  DropdownMenuContent, // Container for dropdown content
  DropdownMenuItem, // Individual item in the dropdown menu
  DropdownMenuTrigger, // Element that triggers the dropdown menu
} from "../ui/dropdown-menu"; // UI components for dropdown functionality
import DeleteCommentDialog from "./DeleteCommentDialog"; // Dialog for confirming comment deletion

// Props interface for the CommentMoreButton component
interface CommentMoreButtonProps {
  comment: CommentData; // Data for the comment related to the dropdown actions
  className?: string; // Optional className for styling
}

// Main CommentMoreButton component for managing additional comment actions
export default function CommentMoreButton({
  comment,
  className,
}: CommentMoreButtonProps) {
  // State to manage the visibility of the delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      {/* Dropdown menu for additional comment actions */}
      <DropdownMenu>
        {/* Trigger for the dropdown menu, rendering as a button */}
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />{" "}
            {/* Icon for the "More" button */}
          </Button>
        </DropdownMenuTrigger>

        {/* Content of the dropdown menu */}
        <DropdownMenuContent>
          {/* Option to delete the comment */}
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" /> {/* Trash icon for delete action */}
              Delete {/* Label for the delete action */}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <DeleteCommentDialog
        comment={comment} // Pass the comment data to the dialog
        open={showDeleteDialog} // Show the dialog based on the local state
        onClose={() => setShowDeleteDialog(false)} // Close the dialog when done
      />
    </>
  );
}
