import { Metadata } from "next";
import LogInForm from "./LogInForm";
import Link from "next/link";
import loginImage from "@/assets/couple_at_computer_cropped.jpg";
import Image from "next/image";

/**Login Page
 * timestamp: 2:27:37
 */

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="rounded=2xl bg-card flex h-full max-h-[55rem] w-full max-w-[64rem] overflow-hidden shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Login to OPENLiNK </h1>
          <div className="space-y-5">
            {/* Login Form */}
            <LogInForm />
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an Account? Sign Up
            </Link>
          </div>
        </div>
        {/* Login Image */}
        <Image
          src={loginImage}
          alt="Login Image"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
