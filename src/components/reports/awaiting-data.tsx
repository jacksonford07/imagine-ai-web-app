import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

// Graceful state while the bot's US-021 report endpoints are still being
// built (or the period has no data yet). Mirrors the /ceo overview pattern.
export function AwaitingData({
  error,
  period,
}: {
  error: string;
  period: string;
}): React.ReactElement {
  return (
    <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4 print:hidden">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="text-sm">
        <p className="font-medium">Awaiting report data</p>
        <p className="mt-1 text-muted-foreground">
          No report payload for {period} yet — this view populates once the bot
          serves the reporting endpoints. ({error})
        </p>
      </div>
    </Card>
  );
}
