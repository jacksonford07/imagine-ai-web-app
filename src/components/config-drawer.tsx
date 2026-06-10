"use client";

import { useTheme } from "next-themes";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useLayout,
  type Collapsible,
  type Variant,
} from "@/context/layout-provider";

function OptionRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <Button
            key={o.value}
            size="sm"
            variant={value === o.value ? "default" : "outline"}
            className={cn(
              "capitalize",
              value !== o.value && "text-muted-foreground",
            )}
            onClick={() => {
              onChange(o.value);
            }}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function ConfigDrawer(): React.ReactElement {
  const { theme, setTheme } = useTheme();
  const { collapsible, setCollapsible, variant, setVariant, resetLayout } =
    useLayout();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="scale-95 rounded-full">
          <Settings className="size-[1.2rem]" />
          <span className="sr-only">Customize layout</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6">
        <SheetHeader className="gap-1">
          <SheetTitle>Customize</SheetTitle>
          <SheetDescription>
            Adjust theme and sidebar layout. Saved to your browser.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <OptionRow<string>
            label="Theme"
            value={theme ?? "system"}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
          <OptionRow<Variant>
            label="Sidebar variant"
            value={variant}
            onChange={setVariant}
            options={[
              { value: "inset", label: "Inset" },
              { value: "sidebar", label: "Sidebar" },
              { value: "floating", label: "Floating" },
            ]}
          />
          <OptionRow<Collapsible>
            label="Collapsible"
            value={collapsible}
            onChange={setCollapsible}
            options={[
              { value: "icon", label: "Icon" },
              { value: "offcanvas", label: "Off" },
              { value: "none", label: "None" },
            ]}
          />
          <Button variant="outline" className="w-full" onClick={resetLayout}>
            Reset to defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
