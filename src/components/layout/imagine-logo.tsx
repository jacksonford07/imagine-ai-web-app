import Image from "next/image";

import { cn } from "@/lib/utils";

export function ImagineLogo({
  className,
}: {
  className?: string;
}): React.ReactElement {
  return (
    <Image
      src="/imagine-logo.png"
      alt="Imagine Education"
      width={64}
      height={64}
      className={cn("rounded-full", className)}
    />
  );
}
