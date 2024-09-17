import { Metadata } from "next";
import signUpImage from "@/assets/laptop_hands_table.jpg";
import logo from "@/assets/open_link_logo_favicon.png";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

/**Sign Up:  */

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="rounded=2xl flex h-full max-h-[55rem] w-full max-w-[64rem] overflow-hidden bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <Image
              src={logo}
              alt="OpenLink Logo"
              className="mx-auto rounded-full border-4 border-gray-500 p-1" // Added object-cover and shadow
              style={{ borderColor: "#2c7494", imageRendering: "auto" }} // Ensures image is smooth
              width={100} // Adjust the width and height to your needs
              height={100}
            />
            <h1 className="text-3xl font-bold">Sign up to OPENLiNK</h1>
            <p className="text-muted-foreground">
              Connect with{" "}
              <span className="italic">Open Source Contributors</span> and{" "}
              <span className="italic">Project Teams</span> and discover
              exciting innovations in todays ever evolving and expanding tech
              eco-system.
            </p>
          </div>
          {/* Sign Up Form */}
          <div className="space-y-5">
            <SignUpForm />
            <Link href="/login" className="block text-center hover:underline">
              Already have an Account? Log In
            </Link>
          </div>
        </div>
        <Image
          src={signUpImage}
          alt="Sign Up"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
