"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

/**
 * updateUserProfile:
 *
 * This function updates the user's profile in the database and also reflects the changes in the Stream chat server.
 * It validates the input values, ensures the user is authenticated, and then performs a database transaction to
 * update the profile. The user's display name is updated in both the database and the Stream chat server.
 *
 * @param {UpdateUserProfileValues} values - The new values for updating the user's profile (e.g., displayName, bio).
 * @returns The updated user profile data.
 */

export async function updateUserProfile(values: UpdateUserProfileValues) {
  // Validate the provided profile update values using the predefined schema
  const validatedValues = updateUserProfileSchema.parse(values);

  // Validate the current user's authentication and retrieve the authenticated user
  const { user } = await validateRequest();

  // If the user is not authenticated, throw an error
  if (!user) throw new Error("Unauthorized");

  console.log("update user profile", user.id);
  // Perform a database transaction to update the user's profile in the database
  const updatedUser = await prisma.$transaction(async (tx) => {
    // Update the user's data in the 'user' table and return the selected fields
    const updatedUser = await tx.user.update({
      where: { id: user.id }, // Identify the user by their ID
      data: validatedValues, // Apply the validated profile updates (e.g., displayName)
      select: getUserDataSelect(user.id), // Select specific fields of the updated user data
    });

    // Update the user's profile in the Stream chat server with the new display name
    await streamServerClient.partialUpdateUser({
      id: user.id, // The ID of the user in Stream
      set: {
        name: validatedValues.displayName, // Update the display name in the Stream server
      },
    });

    return updatedUser; // Return the updated user profile data from the transaction
  });

  // Return the updated user profile data to the caller
  return updatedUser;
}
