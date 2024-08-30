import { z } from "zod";

/**  Validation parameters for emails / passwords etc.
 * Schemas to validate: email, password, username
 *
 * Regex: allow only upper and lower case letters, numbers, underscores and hyphens
 */

const required_string = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: required_string.email("Invalid email address"),
  username: required_string.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Upper / Lower case alphanumeric characters including hyphens and underscores only",
  ),
  password: required_string.min(8, "Password must be at least 86 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: required_string,
  password: required_string,
});

export type LoginValues = z.infer<typeof loginSchema>;