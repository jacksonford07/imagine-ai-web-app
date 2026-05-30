import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SourceError({
  message,
  fetchedAt,
}: {
  message: string;
  fetchedAt: string;
}): React.ReactElement {
  return (
    <Card className="border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            Could not load data
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Attempted {new Date(fetchedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
