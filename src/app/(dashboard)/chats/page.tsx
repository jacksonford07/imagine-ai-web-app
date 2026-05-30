import { PageHeader } from "@/components/widgets/page-header";
import { Card } from "@/components/ui/card";

export default function ChatsPage(): React.ReactElement {
  return (
    <div>
      <PageHeader
        title="Chats"
        description="Student conversations with filters and pagination."
      />
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Coming next: filterable thread table wired to /internal/admin/chats.
      </Card>
    </div>
  );
}
