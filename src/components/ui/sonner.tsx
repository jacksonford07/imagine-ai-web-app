"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps): React.ReactElement {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-3 group-[.toaster]:text-fg-primary group-[.toaster]:border-line group-[.toaster]:shadow-none",
          description: "group-[.toast]:text-fg-muted",
          actionButton:
            "group-[.toast]:bg-brand group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-fill-hover group-[.toast]:text-fg-muted",
        },
      }}
      {...props}
    />
  );
}
