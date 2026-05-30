import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Sample rows — wire to real recent escalations/chats later.
const rows = [
  {
    name: "Olivia Martin",
    detail: "olivia.martin@email.com",
    value: "Escalation",
  },
  { name: "Jackson Lee", detail: "jackson.lee@email.com", value: "Coach req" },
  {
    name: "Isabella Nguyen",
    detail: "isabella.nguyen@email.com",
    value: "Enquiry",
  },
  { name: "William Kim", detail: "will@email.com", value: "Onboarded" },
  { name: "Sofia Davis", detail: "sofia.davis@email.com", value: "Resolved" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RecentActivity(): React.ReactElement {
  return (
    <div className="space-y-8">
      {rows.map((row) => (
        <div key={row.detail} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials(row.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-wrap items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{row.name}</p>
              <p className="text-sm text-muted-foreground">{row.detail}</p>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {row.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
