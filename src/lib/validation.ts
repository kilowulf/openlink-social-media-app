import { z } from "zod";

/**
 * Validation Schemas for various input fields like emails, passwords, usernames, and other data fields.
 *
 * These schemas are used to validate user inputs for different forms in the application, ensuring that
 * inputs like email addresses, passwords, usernames, and other fields adhere to specific rules before
 * being submitted or processed.
 */

// Define a base required string validation that trims whitespace and requires a non-empty input
const required_string = z.string().trim().min(1, "Required");

// Schema for validating sign-up form inputs
export const signUpSchema = z.object({
  email: required_string.email("Invalid email address"), // Validates email format
  username: required_string.regex(
    /^[a-zA-Z0-9_-]+$/, // Allows only letters, numbers, underscores, and hyphens in usernames
    "Upper / Lower case alphanumeric characters including hyphens and underscores only",
  ),
  password: required_string.min(8, "Password must be at least 8 characters"), // Validates minimum password length
});

// TypeScript type inferred from the signUpSchema
export type SignUpValues = z.infer<typeof signUpSchema>;

// Schema for validating login form inputs
export const loginSchema = z.object({
  username: required_string, // Username must be non-empty
  password: required_string, // Password must be non-empty
});

// TypeScript type inferred from the loginSchema
export type LoginValues = z.infer<typeof loginSchema>;

/**
 * Validation Schema for creating a post
 * Ensures that the content of the post is non-empty.
 */
export const createPostSchema = z.object({
  content: required_string, // Post content must not be empty
});

// Schema for validating user profile update inputs
export const updateUserProfileSchema = z.object({
  displayName: required_string, // Display name must be non-empty
  bio: z.string().max(1000, "Must be at most 1000 characters"), // Limits bio to 1000 characters
});

// TypeScript type inferred from the updateUserProfileSchema
export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

/**
 * Validation Schema for creating a comment
 * Ensures that the comment content is non-empty.
 */
export const createCommentSchema = z.object({
  content: required_string, // Comment content must not be empty
});
