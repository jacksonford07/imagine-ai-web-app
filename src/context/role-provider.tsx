"use client";

import * as React from "react";
import type { RoleInfo } from "@/lib/auth/role";

// Serializable role info computed server-side in the dashboard layout and
// shared with client chrome (sidebar, command menu) for nav visibility.
const RoleContext = React.createContext<RoleInfo | null>(null);

export function RoleProvider({
  value,
  children,
}: {
  value: RoleInfo;
  children: React.ReactNode;
}): React.ReactElement {
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleInfo {
  const ctx = React.useContext(RoleContext);
  if (ctx === null) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
