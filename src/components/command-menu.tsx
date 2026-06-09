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
import { useRole } from "@/context/role-provider";
import { sidebarData, filterNavGroups } from "@/components/layout/sidebar-data";

export function CommandMenu(): React.ReactElement {
  const router = useRouter();
  const { open, setOpen } = useSearch();
  const { setTheme } = useTheme();
  const roleInfo = useRole();
  const groups = filterNavGroups(sidebarData.navGroups, roleInfo);

  const run = React.useCallback(
    (fn: () => void) => {
      setOpen(false);
      fn();
    },
    [setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Go to page or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.url}
                  value={`${group.title} ${item.title}`}
                  onSelect={() => {
                    run(() => {
                      router.push(item.url);
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
