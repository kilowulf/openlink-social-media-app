import { AppFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";
/**
 * UploadThing React Helpers:
 *
 * This code generates React helper functions for file uploads using the `uploadthing` library.
 * It provides the `useUploadThing` hook and the `uploadFiles` function to be used in React components
 * for handling file uploads seamlessly in a client-side environment.
 */

// Generate React hooks and functions for file uploads based on the AppFileRouter
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>(); // useUploadThing is a hook for file uploads; uploadFiles is a function to handle file uploads
