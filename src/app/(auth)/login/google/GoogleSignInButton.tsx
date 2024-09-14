import { Button } from "@/components/ui/button"; // Import the Button component from the UI library

/**
 * GoogleSignInButton Component:
 *
 * This component renders a button that allows users to sign in with Google.
 * It wraps the button around an anchor tag (<a>) that links to the Google login URL.
 * The button is styled with a custom outline variant and includes the Google icon next to the "Sign in with Google" text.
 */
export default function GoogleSignInButton() {
  return (
    // Button component with customized styling for Google sign-in
    <Button
      variant="outline"
      className="bg-white text-black hover:bg-gray-100 hover:text-black" // Styles for the button background and hover effects
      asChild // Allows the Button to pass its properties to the anchor tag inside
    >
      <a href="/login/google" className="flex w-full items-center gap-2">
        {/* Anchor tag that redirects to the Google login URL */}
        <GoogleIcon /> {/* Google icon component */}
        Sign in with Google {/* Button text */}
      </a>
    </Button>
  );
}

/**
 * GoogleIcon Component:
 *
 * This component renders the Google logo using SVG. It is used in the GoogleSignInButton component.
 * The SVG contains multiple paths that represent different parts of the Google logo.
 */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 256 262" // Viewbox for scaling the SVG
    >
      {/* Path representing the blue part of the Google logo */}
      <path
        fill="#4285f4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      />
      {/* Path representing the green part of the Google logo */}
      <path
        fill="#34a853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      />
      {/* Path representing the yellow part of the Google logo */}
      <path
        fill="#fbbc05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
      />
      {/* Path representing the red part of the Google logo */}
      <path
        fill="#eb4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      />
    </svg>
  );
}
