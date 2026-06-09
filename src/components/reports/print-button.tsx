"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Save as PDF" on the print route. With `auto`, opens the browser print
// dialog once the document renders (the Export PDF link sets ?auto=1).
export function PrintButton({
  auto = false,
}: {
  auto?: boolean;
}): React.ReactElement {
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      window.print();
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [auto]);

  return (
    <Button
      size="sm"
      className="h-8 gap-1.5 print:hidden"
      onClick={() => {
        window.print();
      }}
    >
      <Printer className="h-3.5 w-3.5" />
      Print / Save as PDF
    </Button>
  );
}
