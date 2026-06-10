"use client";

import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/context/search-provider";

export function Search({
  className = "",
  placeholder = "Search",
}: {
  className?: string;
  placeholder?: string;
}): React.ReactElement {
  const { setOpen } = useSearch();
  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50 sm:w-40 sm:pe-12 md:flex-none lg:w-56 xl:w-64",
        className,
      )}
      onClick={() => {
        setOpen(true);
      }}
    >
      <SearchIcon
        aria-hidden="true"
        className="absolute start-1.5 top-1/2 size-4 -translate-y-1/2"
      />
      <span className="ms-4">{placeholder}</span>
      <kbd className="pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
