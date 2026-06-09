import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getChat } from "@/lib/sources/bot/client";
import { PageHeader } from "@/components/widgets/page-header";
import { SourceError } from "@/components/widgets/source-error";
import { MessageBubble } from "@/components/chats/message-bubble";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { single, type RawSearchParams } from "@/lib/search-params";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ externalId: string }>;
  searchParams: Promise<RawSearchParams>;
}): Promise<React.ReactElement> {
  const { externalId } = await params;
  const sp = await searchParams;

  const { data, error, fetchedAt } = await getChat(
    decodeURIComponent(externalId),
    {
      from: single(sp.from),
      to: single(sp.to),
    },
  );

  return (
    <div>
      <Link
        href="/fulfillment/chats"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to chats
      </Link>

      {error !== null || data === null ? (
        <SourceError
          message={error ?? "thread not found"}
          fetchedAt={fetchedAt}
        />
      ) : (
        <>
          <PageHeader
            title={data.studentName ?? data.studentExternalId}
            description={
              data.studentName !== null ? data.studentExternalId : undefined
            }
            fetchedAt={fetchedAt}
          />

          {data.summary !== null && (
            <Card className="mb-5 bg-muted/30 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Summary
              </p>
              <p className="text-sm text-foreground">{data.summary}</p>
            </Card>
          )}

          {data.escalations.length > 0 && (
            <Card className="mb-5 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Escalations
              </p>
              <div className="space-y-1.5">
                {data.escalations.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={e.status === "open" ? "warning" : "secondary"}
                    >
                      {e.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {e.triggeredBy}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(e.at)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {data.messages.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No messages in this window.
            </Card>
          ) : (
            <div className="space-y-3">
              {data.messages.map((m, i) => (
                <MessageBubble
                  key={`${m.at}-${String(i)}`}
                  direction={m.direction}
                  content={m.content}
                  at={m.at}
                  model={m.model}
                  toneHint={m.toneHint}
                  edited={m.edited}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
