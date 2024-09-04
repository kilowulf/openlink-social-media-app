import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // check for valid session
  const { user } = await validateRequest();

  if (user) redirect("/");

  return <>{children}</>;
}
