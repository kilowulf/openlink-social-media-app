import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

/**
 * This function is an HTTP GET handler designed to clean up unused media files that are not associated
 * with any post in the database. It includes an authorization check using a custom secret key.
 * The media files that have been unused for a certain amount of time (1 day in production) are removed
 * both from the external file storage (via UploadThing API) and the database.
 *
 * Key Features:
 * - Authorization: Verifies request authenticity using a secret key in the `Authorization` header.
 * - Cleanup unused media: Finds media that aren't linked to any posts (orphaned media).
 * - Deletes files from external storage (UploadThing) and removes corresponding entries from the database.
 */

export async function GET(req: Request) {
  try {
    // Check the authorization header for a valid CRON_SECRET token
    const authHeader = req.headers.get("Authorization");

    // If the authorization header does not match the expected CRON_SECRET, return a 401 Unauthorized response
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 },
      );
    }

    // Fetch media entries from the database that are not associated with any post
    // Optionally, filter by media older than 1 day in production
    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null, // Media not linked to any posts
        ...(process.env.NODE_ENV === "production" // In production, only select media older than 1 day
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24), // Older than 24 hours
              },
            }
          : {}),
      },
      select: {
        id: true, // Select media ID
        url: true, // Select media URL
      },
    });

    // Remove files from the external storage (UploadThing)
    new UTApi().deleteFiles(
      unusedMedia.map(
        (m) =>
          m.url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1], // Extract file key from URL
      ),
    );

    // Delete media records from the database where the IDs match the found unused media
    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id), // Delete media entries by IDs
        },
      },
    });

    // Return a successful response
    return new Response();
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
