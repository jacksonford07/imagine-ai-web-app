import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

// "Items need your attention today" banner on the Overview. Amber line (Prism's
// single warning slot). Renders nothing when there's nothing to flag, so a
// healthy day stays clean.
export function AttentionBanner({
  items,
}: {
  items: string[];
}): React.ReactElement | null {
  if (items.length === 0) return null;
  return (
    <Card className="border-warning/30 bg-warning/5 p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-medium text-fg-primary">
            Items need your attention today
          </p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-fg-muted">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
