"use client";

// Import necessary components and libraries
import LoadingButton from "@/components/LoadingButton"; // Custom loading button component
import { PasswordInputReveal } from "@/components/PasswordInputReveal"; // Password input component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Form components for creating form structure
import { Input } from "@/components/ui/input"; // Input field component
import { loginSchema, LoginValues } from "@/lib/validation"; // Validation schema for login form and associated types
import { zodResolver } from "@hookform/resolvers/zod"; // Zod resolver for form validation
import { useState, useTransition } from "react"; // React hooks for state management and transitions
import { useForm } from "react-hook-form"; // React Hook Form library for form state and validation
import { login } from "./actions"; // Login action handler

/**
 * LoginForm Component:
 *
 * This component renders a login form where users can input their username and password.
 * It uses `react-hook-form` for form management, validation with Zod schema, and handles
 * the login process with the `login` action function. It also displays error messages and
 * a loading button when the form is submitting.
 *
 * Key Features:
 * - Form validation using Zod schemas.
 * - State management for error handling and form submission state.
 * - Handles form submission and login logic.
 * - Shows loading state when the form is being submitted.
 */
export default function LoginForm() {
  // State to track error messages (e.g., incorrect username or password)
  const [error, setError] = useState<string>();

  // React's useTransition hook to manage pending state during form submission
  const [isPending, startTransition] = useTransition();

  // Initialize the form with validation using Zod and set default values
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema), // Zod validation schema for login
    defaultValues: {
      username: "", // Default value for the username input
      password: "", // Default value for the password input
    },
  });

  /**
   * onSubmit:
   *
   * This function is triggered when the form is submitted. It resets any previous error,
   * starts a transition for the login process, and if an error is returned from the `login`
   * action, it updates the `error` state.
   *
   * @param values - The values submitted by the user (username and password).
   */
  async function onSubmit(values: LoginValues) {
    setError(undefined); // Clear any previous error
    startTransition(async () => {
      // Attempt login with the provided credentials
      const { error } = await login(values);
      if (error) setError(error); // If an error occurs, set the error message
    });
  }

  return (
    // Render the form component
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Display an error message if login fails */}
        {error && <p className="text-center text-destructive">{error}</p>}

        {/* Username input field */}
        <FormField
          control={form.control} // Control from react-hook-form
          name="username" // Name of the field in the form state
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />{" "}
                {/* Input component */}
              </FormControl>
              <FormMessage /> {/* Form validation error message */}
            </FormItem>
          )}
        />

        {/* Password input field */}
        <FormField
          control={form.control} // Control from react-hook-form
          name="password" // Name of the field in the form state
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInputReveal placeholder="Password" {...field} />{" "}
                {/* Password input component */}
              </FormControl>
              <FormMessage /> {/* Form validation error message */}
            </FormItem>
          )}
        />

        {/* Submit button with loading state */}
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Log in
        </LoadingButton>
      </form>
    </Form>
  );
}
