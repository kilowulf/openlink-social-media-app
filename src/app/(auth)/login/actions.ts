"use server";

import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Process login  */

export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    // validate end-point credentials
    const { username, password } = loginSchema.parse(credentials);
    // query db for user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    // check for existing user
    if (!existingUser || !existingUser.passwordHash) {
      return { error: "Invalid username or password" };
    }

    // validate password
    const isPasswordValid = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!isPasswordValid) {
      return { error: "Invalid username or password" };
    }

    // session creation
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // direct validated user to home
    return redirect("/");
  } catch (error) {
    // check for redirect error
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      error: "Something went wrong. Please try again (login / actions)",
    };
    // check for validation error
  }
}
