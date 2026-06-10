"use client";

import * as React from "react";

export type Collapsible = "offcanvas" | "icon" | "none";
export type Variant = "inset" | "sidebar" | "floating";

const COLLAPSIBLE_COOKIE = "layout_collapsible";
const VARIANT_COOKIE = "layout_variant";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const DEFAULT_COLLAPSIBLE: Collapsible = "icon";
const DEFAULT_VARIANT: Variant = "inset";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.split("=")[1];
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; max-age=${String(COOKIE_MAX_AGE)}`;
}

interface LayoutContextValue {
  collapsible: Collapsible;
  setCollapsible: (c: Collapsible) => void;
  variant: Variant;
  setVariant: (v: Variant) => void;
  resetLayout: () => void;
  defaultCollapsible: Collapsible;
  defaultVariant: Variant;
}

const LayoutContext = React.createContext<LayoutContextValue | null>(null);

export function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [collapsible, _setCollapsible] =
    React.useState<Collapsible>(DEFAULT_COLLAPSIBLE);
  const [variant, _setVariant] = React.useState<Variant>(DEFAULT_VARIANT);

  // Hydrate from cookie after mount to avoid SSR/client mismatch.
  React.useEffect(() => {
    const c = readCookie(COLLAPSIBLE_COOKIE);
    const v = readCookie(VARIANT_COOKIE);
    if (c === "icon" || c === "offcanvas" || c === "none") _setCollapsible(c);
    if (v === "inset" || v === "sidebar" || v === "floating") _setVariant(v);
  }, []);

  const setCollapsible = React.useCallback((c: Collapsible) => {
    _setCollapsible(c);
    writeCookie(COLLAPSIBLE_COOKIE, c);
  }, []);

  const setVariant = React.useCallback((v: Variant) => {
    _setVariant(v);
    writeCookie(VARIANT_COOKIE, v);
  }, []);

  const resetLayout = React.useCallback(() => {
    setCollapsible(DEFAULT_COLLAPSIBLE);
    setVariant(DEFAULT_VARIANT);
  }, [setCollapsible, setVariant]);

  const value = React.useMemo<LayoutContextValue>(
    () => ({
      collapsible,
      setCollapsible,
      variant,
      setVariant,
      resetLayout,
      defaultCollapsible: DEFAULT_COLLAPSIBLE,
      defaultVariant: DEFAULT_VARIANT,
    }),
    [collapsible, setCollapsible, variant, setVariant, resetLayout],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const ctx = React.useContext(LayoutContext);
  if (ctx === null) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return ctx;
}
