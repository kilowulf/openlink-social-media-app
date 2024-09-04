"use server";

import { lucia, validateRequest } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**Logout logic */

export async function logout() {
  const { session } = await validateRequest();
  // check to ensure session is validated
  if (!session) {
    throw new Error("Unauthorized access");
  }

  // invalidate session
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/login");
}
