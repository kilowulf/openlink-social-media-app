import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

/**
 * useMediaUpload Hook:
 *
 * This custom React hook is responsible for handling file attachments in a post. It facilitates the upload of media files (like images or videos) with progress tracking and error handling.
 * It provides several utility functions to start uploads, remove attachments, reset the state, and manage the overall process.
 *
 * Key Features:
 * - Manages file attachments in posts.
 * - Tracks upload progress and handles errors.
 * - Enforces a limit on the number of attachments (5 attachments max).
 */

export interface Attachment {
  file: File; // The file to be uploaded
  mediaId?: string; // ID of the media after successful upload
  isUploading: boolean; // Upload status flag
}

export default function useMediaUpload() {
  // Toast notifications for upload errors or progress
  const { toast } = useToast();

  // Attachments state to manage files attached for upload
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // State to track the progress of the current upload
  const [uploadProgress, setUploadProgress] = useState<number>();

  // Upload hook for initiating file uploads
  const { startUpload, isUploading } = useUploadThing("attachment", {
    /**
     * onBeforeUploadBegin: This event is triggered before the upload starts.
     * It renames the files to a unique format (using a UUID) and stores them in the state with `isUploading` set to true.
     */
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop(); // Get the file extension
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`, // Rename file with UUID
          {
            type: file.type,
          },
        );
      });

      // Add renamed files to the attachments state and mark them as uploading
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);

      return renamedFiles; // Pass renamed files to upload function
    },

    // Tracks the progress of the upload and updates the state
    onUploadProgress: setUploadProgress,

    /**
     * onClientUploadComplete: When the upload is complete, this function updates the state
     * to mark the attachments as uploaded and store the media ID.
     */
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((a) => {
          // a = attachment; r = result
          const uploadResult = res.find((r) => r.name === a.file.name); // Find the result for the uploaded file

          if (!uploadResult) return a; // If no result found, return attachment unchanged

          return {
            ...a,
            mediaId: uploadResult.serverData.mediaId, // Store the media ID from the server response
            isUploading: false, // Mark the file as no longer uploading
          };
        }),
      );
    },

    /**
     * onUploadError: This handles errors during the upload process.
     * It removes any attachments that were in the process of uploading and shows a toast notification with the error message.
     */
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading)); // Remove uploading files from the state
      toast({
        variant: "destructive",
        description: e.message, // Show error message
      });
    },
  });

  /**
   * handleStartUpload: Initiates the upload process for selected files.
   * It ensures that the current upload is finished before starting a new one, and enforces the maximum attachment limit (5 files).
   */
  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current upload to finish.", // Prevent multiple uploads at the same time
      });
      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload up to 5 attachments per post.", // Enforce attachment limit
      });
      return;
    }

    startUpload(files); // Start the upload process for the selected files
  }

  /**
   * removeAttachment: Removes a file from the attachments list by file name.
   */
  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName)); // Remove the file from the state
  }

  /**
   * reset: Resets the state, clearing attachments and upload progress.
   */
  function reset() {
    setAttachments([]); // Clear the attachment list
    setUploadProgress(undefined); // Reset the upload progress
  }

  // Return the available actions and state related to media upload
  return {
    startUpload: handleStartUpload, // Function to start the upload
    attachments, // The current list of file attachments
    isUploading, // Whether an upload is currently in progress
    uploadProgress, // The current upload progress (if any)
    removeAttachment, // Function to remove a file attachment
    reset, // Function to reset the state
  };
}
