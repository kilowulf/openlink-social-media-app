import avatarPlaceholder from "@/assets/user_avatar_image_placeholder.jpg";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { useUpdateProfileMutation } from "./mutations";
import CropImageDialog from "@/components/CropImageDialog";
import "cropperjs/dist/cropper.css";

/** Edit Profile Dialog:
 *
 * This component renders a modal dialog that allows users to update their profile information,
 * including their display name, bio, and avatar. It leverages `react-hook-form` for form state
 * management and validation with Zod schemas. Users can upload a new avatar, which is resized
 * and cropped using a custom crop dialog (`CropImageDialog`). The form submission triggers a
 * mutation to update the profile data on the server, and upon success, the dialog is closed and
 * the avatar is reset.
 *
 * Key Features:
 * - Avatar upload, resize, and crop functionality
 * - Validation for display name and bio
 * - Integration with server-side mutations to update user information
 * - Loading button feedback during form submission
 * - Dialog opens and closes based on the `open` prop
 */

interface EditProfileDialogProps {
  user: UserData; // The current user's data passed to the dialog.
  open: boolean; // Boolean state to control whether the dialog is open or closed.
  onOpenChange: (open: boolean) => void; // Callback function to handle dialog open/close state changes.
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  // Initialize the form with validation using the Zod schema for updating the user profile.
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema), // Resolves form validation using Zod.
    defaultValues: {
      displayName: user.displayName, // Prefill the form with the user's current display name.
      bio: user.bio || "", // Prefill the form with the user's current bio (if any).
    },
  });

  // Mutation hook to handle updating the user's profile on the server.
  const mutation = useUpdateProfileMutation();

  // State to hold the cropped avatar image (if the user uploads a new one).
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);

  // Handle form submission: prepare the avatar image file and send form data using the mutation.
  async function onSubmit(values: UpdateUserProfileValues) {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`) // Create a new avatar file if the user uploads one.
      : undefined;

    mutation.mutate(
      {
        values, // User input (display name and bio).
        avatar: newAvatarFile, // Avatar file if available.
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null); // Reset the avatar state after a successful submission.
          onOpenChange(false); // Close the dialog upon successful update.
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle> {/* Dialog title */}
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Avatar</Label> {/* Avatar input section */}
          <AvatarInput
            src={
              croppedAvatar
                ? URL.createObjectURL(croppedAvatar) // Preview the cropped avatar if available.
                : user.avatarUrl || avatarPlaceholder // Show the user's current avatar or a placeholder.
            }
            onImageCropped={setCroppedAvatar} // Handle cropped image from the AvatarInput.
          />
        </div>
        {/* Form for editing profile details */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Form field for updating display name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Form field for updating bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData; // The source URL for the avatar image.
  onImageCropped: (blob: Blob | null) => void; // Callback to handle the cropped image.
}

// AvatarInput component: allows the user to upload and crop their avatar.
function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>(); // State to hold the image selected for cropping.

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for accessing the file input element.

  // Handle image selection and resize it before cropping.
  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024, // Set max width/height for the resized image.
      1024,
      "WEBP", // Convert image to WEBP format.
      100,
      0,
      (uri) => setImageToCrop(uri as File), // Set the resized image for cropping.
      "file",
    );
  }

  return (
    <>
      {/* Hidden file input field for uploading images */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      {/* Button to trigger the file input dialog */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src} // Display the current or newly cropped avatar.
          alt="Avatar preview"
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover"
        />
        {/* Overlay with camera icon that appears on hover */}
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
          <Camera size={24} /> {/* Camera icon for avatar upload */}
        </span>
      </button>
      {/* Crop dialog for the selected image */}
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)} // Show the image in the crop dialog.
          cropAspectRatio={1} // Ensure the avatar is cropped to a square aspect ratio.
          onCropped={onImageCropped} // Pass the cropped image back to the parent component.
          onClose={() => {
            setImageToCrop(undefined); // Reset the image state if the dialog is closed.
            if (fileInputRef.current) {
              fileInputRef.current.value = ""; // Clear the file input.
            }
          }}
        />
      )}
    </>
  );
}
