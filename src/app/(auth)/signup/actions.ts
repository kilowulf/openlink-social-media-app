"use server";

// Importing necessary libraries and modules
import { lucia } from "@/auth"; // Authentication library
import prisma from "@/lib/prisma"; // Prisma client for database interaction
import streamServerClient from "@/lib/stream"; // Stream client for chat-related actions
import { signUpSchema, SignUpValues } from "@/lib/validation"; // Validation schema for user sign-up
import { hash } from "@node-rs/argon2"; // Argon2 library for password hashing
import { generateIdFromEntropySize } from "lucia"; // Function to generate user IDs
import { isRedirectError } from "next/dist/client/components/redirect"; // Error handling for redirects in Next.js
import { cookies } from "next/headers"; // Cookie handling from Next.js
import { redirect } from "next/navigation"; // Redirection utility from Next.js

/**
 * signUp function:
 *
 * This function handles the sign-up process for new users. It validates the user input,
 * checks for existing usernames and emails, creates the user in the database,
 * and sets up a session with authentication. Additionally, it registers the user in
 * the Stream chat system and redirects the user to the homepage upon successful sign-up.
 *
 * @param credentials - The user's sign-up data, including username, email, and password.
 * @returns An object with an error message if the sign-up process fails.
 */
export async function signUp(
  credentials: SignUpValues, // User-provided sign-up information
): Promise<{ error: string }> {
  try {
    // Validate the sign-up credentials against the signUpSchema
    const { username, email, password } = signUpSchema.parse(credentials);

    // Hash the password using Argon2 for secure storage
    const passwordHash = await hash(password, {
      memoryCost: 19456, // Memory cost parameter for Argon2
      timeCost: 2, // Time cost parameter for Argon2
      outputLen: 32, // Length of the output hash
      parallelism: 1, // Parallelism factor for Argon2
    });

    // Generate a unique user ID with a specified entropy size
    const userId = generateIdFromEntropySize(10);

    // Check if the username already exists in the database (case-insensitive)
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Case-insensitive matching
        },
      },
    });

    // If the username is taken, return an error
    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    // Check if the email is already registered in the database (case-insensitive)
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive", // Case-insensitive matching
        },
      },
    });

    // If the email is already in use, return an error
    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    // Create the new user within a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Insert the new user into the database
      await tx.user.create({
        data: {
          id: userId, // User ID
          username, // Username
          displayName: username, // Default display name is set to the username
          email, // User's email
          passwordHash, // Hashed password
        },
      });

      // Register the user in the Stream chat service
      await streamServerClient.upsertUser({
        id: userId, // User ID for Stream
        username, // Username for Stream
        name: username, // Display name in Stream
      });
    });

    // Create a session for the user using the Lucia authentication library
    const session = await lucia.createSession(userId, {});

    // Create a session cookie and set it in the browser
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name, // Cookie name
      sessionCookie.value, // Cookie value (session ID)
      sessionCookie.attributes, // Cookie attributes (e.g., expiration)
    );

    // Redirect the user to the homepage after successful sign-up
    return redirect("/");
  } catch (error) {
    // If a redirect-related error occurs, rethrow it
    if (isRedirectError(error)) throw error;

    // Log the error and return a generic error message
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
