"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Copies the current report URL (tab + period in the query string). The link
// is shareable but still behind the auth gate — middleware redirects
// signed-out visitors to /signin.
export function CopyLinkButton(): React.ReactElement {
  const onClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", {
        description: "Recipients must be signed in to view it.",
      });
    } catch {
      toast.error("Could not copy link", {
        description: "Copy the URL from the address bar instead.",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={() => {
        void onClick();
      }}
    >
      <Link2 className="h-3.5 w-3.5" />
      Copy link
    </Button>
  );
}
