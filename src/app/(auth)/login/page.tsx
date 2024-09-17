// Import necessary modules and components
import loginImage from "@/assets/login_women.png"; // Importing the login image asset
import { Metadata } from "next"; // Type for handling metadata in Next.js
import Image from "next/image"; // Next.js Image component for optimized image rendering
import Link from "next/link"; // Next.js Link component for client-side navigation
import GoogleSignInButton from "./google/GoogleSignInButton"; // Custom Google sign-in button component
import LoginForm from "./LogInForm"; // Importing the LoginForm component
import logo from "@/assets/open_link_logo_favicon.png";

// Metadata object for setting the title of the login page
export const metadata: Metadata = {
  title: "Login", // The title that appears in the browser tab for this page
};

/**
 * Page Component:
 *
 * This component renders the login page. It includes options for users to log in with Google, a form
 * for logging in with a username and password, and a link to sign up for new users. The layout is
 * divided into two sections: the login form and an image, with the image hidden on smaller screens.
 *
 * Key Features:
 * - Displays login form and Google sign-in button.
 * - Includes a link to navigate to the sign-up page.
 * - Responsive layout that adapts to screen sizes (image is hidden on smaller screens).
 */
export default function Page() {
  return (
    // Main container for the page layout
    <main className="flex h-screen items-center justify-center p-5">
      {/* Container for the login form and image */}
      <div className="flex h-full max-h-[55rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Left side: Login form and Google sign-in button */}
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <Image
            src={logo}
            alt="OpenLink Logo"
            className="mx-auto rounded-full border-4 border-gray-500 p-1" // Added object-cover and shadow
            style={{ borderColor: "#3f819c", imageRendering: "auto" }} // Ensures image is smooth
            width={100} // Adjust the width and height to your needs
            height={100}
          />
          {/* Title of the login page */}
          <h1 className="text-center text-3xl font-bold">Login to OPENLiNK</h1>

          {/* Container for login options */}
          <div className="space-y-5">
            {/* Google sign-in button */}
            <GoogleSignInButton />

            {/* Divider between Google login and manual login form */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" /> {/* Line before OR */}
              <span>OR</span> {/* "OR" text */}
              <div className="h-px flex-1 bg-muted" /> {/* Line after OR */}
            </div>

            {/* Manual login form (username and password fields) */}
            <LoginForm />

            {/* Link to the sign-up page for users who don't have an account */}
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>

        {/* Right side: Displaying the image (hidden on smaller screens) */}
        <Image
          src={loginImage} // Image asset for the login page
          alt="" // Alt text for accessibility (empty in this case)
          className="hidden w-1/2 object-cover md:block" // Only visible on medium and larger screens
        />
      </div>
    </main>
  );
}
