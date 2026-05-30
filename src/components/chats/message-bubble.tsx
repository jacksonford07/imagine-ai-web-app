import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

export interface MessageBubbleProps {
  direction: "in" | "out";
  content: string;
  at: string;
  model: string | null;
  toneHint: string | null;
  edited: boolean;
}

export function MessageBubble({
  direction,
  content,
  at,
  model,
  toneHint,
  edited,
}: MessageBubbleProps): React.ReactElement {
  const outbound = direction === "out";
  return (
    <div className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          outbound ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
            outbound
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-muted text-foreground",
          )}
        >
          {content}
        </div>
        <div
          className={cn(
            "flex flex-wrap gap-x-2 text-[11px] text-muted-foreground",
            outbound ? "justify-end" : "justify-start",
          )}
        >
          <span>{formatDateTime(at)}</span>
          {model !== null && <span>· {model}</span>}
          {toneHint !== null && <span>· {toneHint}</span>}
          {edited && <span>· edited</span>}
        </div>
      </div>
    </div>
  );
}
