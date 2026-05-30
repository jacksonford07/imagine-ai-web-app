import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}): React.ReactElement {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon !== undefined && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint !== undefined && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}
