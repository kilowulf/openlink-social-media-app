"use client";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

// Interface defining the props for the EditProfileButton component.
// The component expects a `user` prop containing the user's data.
interface EditProfileButtonProps {
  user: UserData; // TypeScript type defining the user prop passed into the component.
}

// Component for the "Edit Profile" button, which opens a dialog to allow the user to edit their profile.
export default function EditProfileButton({ user }: EditProfileButtonProps) {
  // useState hook to manage the visibility state of the edit profile dialog (modal).
  // `showDialog` is the boolean state, and `setShowDialog` is the function to update this state.
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {/* Button that triggers the opening of the edit profile dialog. 
          When clicked, it sets `showDialog` to `true`. */}
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Edit profile
      </Button>

      {/* The dialog component that contains the edit profile form. 
          It's controlled by the `showDialog` state.
          - `user`: The current user data is passed as a prop.
          - `open`: Controls whether the dialog is visible based on the `showDialog` state.
          - `onOpenChange`: A callback to change the dialog's open/close state. */}
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog} // Updates the dialog's state when it's opened or closed.
      />
    </>
  );
}
