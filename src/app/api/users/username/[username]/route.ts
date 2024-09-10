import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

/**
 * User Route (GET):
 * 
 * This route handles fetching detailed user information based on the username provided in the URL parameters. 
 * It ensures that the request is validated by checking the logged-in user's authentication status and retrieves 
 * data for the specified user in a case-insensitive manner. It returns a JSON response containing the user's profile 
 * data or relevant error messages (e.g., if the user is unauthorized or the username doesn't exist).
 */


export async function GET(
  req: Request, // The incoming request object.
  { params: { username } }: { params: { username: string } }, // Extracts the 'username' from the request's URL parameters.
) {
  try {
    // Validate the request and retrieve the logged-in user.
    const { user: loggedInUser } = await validateRequest();

    // If the user is not authenticated, return an "Unauthorized" response.
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database for the user matching the provided username (case-insensitive search).
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username, // Check if the username matches exactly.
          mode: "insensitive", // Make the search case-insensitive.
        },
      },
      // Select specific user data fields, including relevant fields for the logged-in user.
      select: getUserDataSelect(loggedInUser.id),
    });

    // If the user is not found, return a "User not found" error.
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user data as a JSON response.
    return Response.json(user);
  } catch (error) {
    // Log any errors that occur and return a generic "Internal server error" response.
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}