import { createRouteHandler } from "uploadthing/next";
import { fileRouter } from "./core";

/**
 * File Upload Route Handler:
 * - GET / POST endpoint
 * This code defines HTTP route handlers (`GET` and `POST`) for file uploads using the `uploadthing` library.
 * It connects the `fileRouter` (which contains the logic for handling file uploads) to these handlers,
 * making the file upload routes accessible via GET and POST requests.
 */

// Create and export GET and POST route handlers using the fileRouter
// These handlers will be used to handle GET and POST requests for file uploads
export const { GET, POST } = createRouteHandler({
  router: fileRouter, // Connect the fileRouter that defines how files are uploaded and processed
});
