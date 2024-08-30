"use server";

import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SignUpValues, signUpSchema } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";

/**Server URL action:
 * Prisma: Object relational mapper (orm)
 */

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    // retrieve validated credentials
    const { username, password, email } = signUpSchema.parse(credentials);

    // generate hash from validated password
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    // search db for username
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    // check if username exists
    if (existingUsername) {
      return { error: "Username already exists" };
    }

    // check for email address
    const exisitingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    // check if email exists
    if (exisitingEmail) {
      return { error: "Email already exists" };
    }

    // create new user
    await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },
    });

    // session creation
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // direct user after validation / user creation
    return redirect("/");

    // search db for email
  } catch (error) {
    // check for redirection error
    if (isRedirectError(error)) {
      throw error;
    }

    console.log(error);
    return { error: "Something went wrong. Please try again (signup/actions)" };
  }
}
