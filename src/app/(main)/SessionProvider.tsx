"use client";

import { Session, User } from "lucia"; 
import React, { createContext, useContext } from "react"; 

// General Functionality:
// This code provides a session management system in a React client-side application using the Lucia authentication library. It creates a `SessionProvider` component that wraps the app and makes user session data available via React context. The `useSession` custom hook is used to access this session data in any child component of the provider.

// Interface to define the structure of session context
interface SessionContext {
  user: User; // User object containing details about the authenticated user
  session: Session; // Session object with data about the current session
}

// Create a context for session data with the `SessionContext` interface
const SessionContext = createContext<SessionContext | null>(null); // Initially, the context is set to null

/**
 * SessionProvider:
 *
 * This component provides session data (user and session) to all children components wrapped by it.
 * It uses React's Context API to make the session data accessible anywhere within the app, as long as the children
 * are wrapped within the `SessionProvider`.
 *
 * @param {React.PropsWithChildren<{ value: SessionContext }>} props - children components and the session value.
 * @returns JSX element that provides session data context.
 */
export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    // Providing session context to all child components
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * useSession:
 *
 * This is a custom React hook that allows any component within the `SessionProvider` tree to access
 * the current user and session data.
 *
 * It retrieves the session data from the `SessionContext` using `useContext`. If the hook is used outside
 * of the `SessionProvider`, it throws an error to ensure the context is not misused.
 *
 * @returns {SessionContext} - The user and session data stored in the context.
 */
export function useSession() {
  // Retrieve the session context
  const context = useContext(SessionContext);

  // If the context is not available, throw an error to ensure the hook is used properly
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context; // Return the session context (user and session data)
}
