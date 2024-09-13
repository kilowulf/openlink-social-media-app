"use server";

// Importing necessary libraries and modules
import { lucia } from "@/auth"; // Authentication library
import prisma from "@/lib/prisma"; // Prisma client for database interaction
import { loginSchema, LoginValues } from "@/lib/validation"; // Validation schema for user login
import { verify } from "@node-rs/argon2"; // Argon2 library for password verification
import { isRedirectError } from "next/dist/client/components/redirect"; // Error handling for redirects in Next.js
import { cookies } from "next/headers"; // Cookie handling from Next.js
import { redirect } from "next/navigation"; // Redirection utility from Next.js

/**
 * login function:
 *
 * This function handles the login process for users. It validates the user's input credentials,
 * checks the username and password against the database, verifies the password, and creates a session
 * if authentication is successful. If login fails, it returns an error message.
 *
 * @param credentials - The user's login credentials (username and password).
 * @returns An object with an error message if login fails, or redirects to the homepage on success.
 */
export async function login(
  credentials: LoginValues, // User-provided login information
): Promise<{ error: string }> {
  try {
    // Validate the login credentials against the loginSchema
    const { username, password } = loginSchema.parse(credentials);

    // Check if the user exists in the database by username (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Case-insensitive matching
        },
      },
    });

    // If the user does not exist or doesn't have a password hash, return an error
    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password",
      };
    }

    // Verify the password using Argon2
    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456, // Memory cost parameter for Argon2
      timeCost: 2, // Time cost parameter for Argon2
      outputLen: 32, // Length of the output hash
      parallelism: 1, // Parallelism factor for Argon2
    });

    // If the password is invalid, return an error
    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      };
    }

    // Create a session for the user using Lucia's authentication library
    const session = await lucia.createSession(existingUser.id, {});

    // Create a session cookie and set it in the browser
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name, // Cookie name
      sessionCookie.value, // Cookie value (session ID)
      sessionCookie.attributes, // Cookie attributes (e.g., expiration)
    );

    // Redirect the user to the homepage after successful login
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
