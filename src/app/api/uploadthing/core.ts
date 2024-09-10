import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";

import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

/**
 * File Upload Core Router:
 *
 * This code defines routes and logic for handling file uploads (avatars and media attachments) in a web application.
 * It uses the `uploadthing` library to manage the file upload process, including setting file size limits, performing
 * middleware-based authentication, and processing uploads once they are complete. The uploaded files are then used
 * to update user data (like avatar URLs) or stored as media in the database. This code is structured to work with
 * `Prisma` (for database operations) and `Stream` (for updating user data in a real-time communication service).
 */

// Create an Uploadthing instance (used to define file upload routes)
const f = createUploadthing();

// File router for handling avatar and media uploads
export const fileRouter = {
  // Avatar upload route
  avatar: f({
    image: { maxFileSize: "512KB" }, // Limits avatar file size to 512KB
  })
    .middleware(async () => {
      // Middleware for authentication
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized"); // If user is not authenticated, throw an error

      return { user }; // Return authenticated user data to be used in the upload process
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Handle actions after the avatar upload is complete
      const oldAvatarUrl = metadata.user.avatarUrl;

      // If the user already has an avatar, delete the old avatar
      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];

        await new UTApi().deleteFiles(key); // Delete the old avatar using Uploadthing's API
      }

      // Update the URL of the new avatar file
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      // Update the user's avatar in the database and real-time service (Stream)
      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            avatarUrl: newAvatarUrl,
          },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      return { avatarUrl: newAvatarUrl }; // Return the new avatar URL
    }),

  // Attachment upload route (supports both images and videos)
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 }, // Limit image uploads to 4MB per file, up to 5 files
    video: { maxFileSize: "64MB", maxFileCount: 5 }, // Limit video uploads to 64MB per file, up to 5 files
  })
    .middleware(async () => {
      // Middleware for authentication
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized"); // If the user is not authenticated, throw an error

      return {}; // No additional data needed for attachment uploads
    })
    .onUploadComplete(async ({ file }) => {
      // Handle actions after the file upload is complete
      const media = await prisma.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO", // Set the media type (image or video)
        },
      });

      return { mediaId: media.id }; // Return the ID of the newly created media entry
    }),
} satisfies FileRouter; // Ensure the file router satisfies the FileRouter type

export type AppFileRouter = typeof fileRouter; // Export the type of the file router
