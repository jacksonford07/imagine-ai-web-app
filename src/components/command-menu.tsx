"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useSearch } from "@/context/search-provider";
import { sidebarData } from "@/components/layout/sidebar-data";

export function CommandMenu(): React.ReactElement {
  const router = useRouter();
  const { open, setOpen } = useSearch();
  const { setTheme } = useTheme();

  const run = React.useCallback(
    (fn: () => void) => {
      setOpen(false);
      fn();
    },
    [setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {sidebarData.navGroups.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => {
              if (item.url === undefined) return null;
              const Icon = item.icon;
              const url = item.url;
              return (
                <CommandItem
                  key={url}
                  value={`${group.title} ${item.title}`}
                  onSelect={() => {
                    run(() => {
                      router.push(url);
                    });
                  }}
                >
                  {Icon !== undefined && <Icon />}
                  {item.title}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => {
              run(() => {
                setTheme("light");
              });
            }}
          >
            <Sun /> Light
          </CommandItem>
          <CommandItem
            onSelect={() => {
              run(() => {
                setTheme("dark");
              });
            }}
          >
            <Moon /> Dark
          </CommandItem>
          <CommandItem
            onSelect={() => {
              run(() => {
                setTheme("system");
              });
            }}
          >
            <Laptop /> System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
