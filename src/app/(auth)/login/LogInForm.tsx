"use client";

import { loginSchema, LoginValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { login } from "./actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInputReveal } from "@/components/PasswordInputReveal";
import LoadingButton from "@/components/LoadingButton";

/** Login Client Form
 *
 */

export default function LogInForm() {
  // state
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  // form parameters
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // submit function
  const onSubmit = async (values: LoginValues) => {
    // set errors
    setError(undefined);
    // set transition
    startTransition(async () => {
      const { error } = await login(values);
      if (error) setError(error);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <p className="text-destructive text-center">{error}</p>}{" "}
        {/* username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User name</FormLabel>
              <FormControl>
                <Input placeholder="User name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                {/* password input reveal */}
                <PasswordInputReveal
                  placeholder="Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Loading Button */}
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Log in
        </LoadingButton>
      </form>
    </Form>
  );
}
