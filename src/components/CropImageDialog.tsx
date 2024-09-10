import "cropperjs/dist/cropper.css"; 
import { useRef } from "react"; 
import { Cropper, ReactCropperElement } from "react-cropper"; 
import { Button } from "./ui/button"; 
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

/** CropImageDialog Component:
 *
 * This component provides a modal dialog for cropping an uploaded image using the Cropper.js library.
 * It is used for scenarios where users need to crop an image to a specified aspect ratio before
 * uploading or saving it. The image is displayed in a cropper interface, and the user can crop it to
 * the desired size. Once the image is cropped, the resulting image blob is returned to the parent
 * component via a callback function (`onCropped`). The component also includes buttons to confirm or
 * cancel the cropping operation.
 *
 * Key Features:
 * - Image cropping using Cropper.js with customizable aspect ratio.
 * - Modal dialog interface with options to crop or cancel.
 * - Handles the image cropping result by converting the cropped area into a `Blob`.
 * - Integrates with the parent component via `onCropped` and `onClose` callbacks.
 */

interface CropImageDialogProps {
  src: string; // The source of the image to be cropped.
  cropAspectRatio: number; // The aspect ratio for cropping (e.g., 1 for square).
  onCropped: (blob: Blob | null) => void; // Callback function to handle the cropped image blob.
  onClose: () => void; // Callback function to handle closing the dialog.
}

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  // Reference to the Cropper.js instance that allows us to manipulate the cropper programmatically.
  const cropperRef = useRef<ReactCropperElement>(null);

  // Function to trigger the cropping action. It retrieves the cropped image from the Cropper instance
  // and converts it into a Blob in "image/webp" format.
  function crop() {
    const cropper = cropperRef.current?.cropper; // Access the Cropper instance.
    if (!cropper) return; // If no cropper instance, exit early.

    // Get the cropped image and convert it to a Blob. Once done, invoke the `onCropped` callback.
    cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp");

    // Close the dialog once the cropping is complete.
    onClose();
  }

  return (
    // Render a modal dialog with cropping functionality.
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle> {/* Title of the dialog box. */}
        </DialogHeader>

        {/* The Cropper component from `react-cropper`, used to allow the user to adjust the crop. 
            - `src`: Source image to be cropped.
            - `aspectRatio`: The aspect ratio of the crop (passed as a prop).
            - `guides`: Hide guides for a cleaner interface.
            - `zoomable`: Disables zooming.
            - `ref`: Assigns the cropper instance to `cropperRef` for later use in the `crop` function. */}
        <Cropper
          src={src}
          aspectRatio={cropAspectRatio}
          guides={false}
          zoomable={false}
          ref={cropperRef}
          className="mx-auto size-fit" // Style to ensure the cropper is centered and fits well.
        />

        {/* Footer section with action buttons */}
        <DialogFooter>
          {/* Cancel button: Closes the dialog without cropping the image */}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {/* Crop button: Calls the `crop` function to perform the cropping operation */}
          <Button onClick={crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
