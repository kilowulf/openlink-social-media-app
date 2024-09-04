"use client";

import { Session, User } from "lucia";
import React, { createContext, useContext } from "react";

// create a interface for a context
// timestamp: 2:43:45
interface SessionContext {
  user: User;
  session: Session;
}

// create context for session
const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// custom session hook
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
