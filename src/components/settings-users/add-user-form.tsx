"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addDashboardUser } from "@/lib/actions/admin-users";
import type { Role } from "@/lib/auth/role";
import { FulfillmentToggle } from "./fulfillment-toggle";

export function AddUserForm(): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [fulfillmentAccess, setFulfillmentAccess] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    startTransition(async () => {
      const result = await addDashboardUser({ email, role, fulfillmentAccess });
      if (!result.ok) {
        toast.error("Could not add user", { description: result.error });
        return;
      }
      toast.success(`Added ${email.trim().toLowerCase()}`);
      setEmail("");
      setRole("viewer");
      setFulfillmentAccess(false);
      router.refresh();
    });
  };

  return (
    <Card className="border-glass-border bg-glass p-4">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-3"
        aria-label="Add user"
      >
        <div className="min-w-56 flex-1">
          <label
            htmlFor="add-user-email"
            className="mb-1.5 block text-xs font-medium text-fg-muted"
          >
            Email
          </label>
          <Input
            id="add-user-email"
            type="email"
            required
            placeholder="name@fanvue.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            className="h-9"
          />
        </div>
        <div>
          <label
            htmlFor="add-user-role"
            className="mb-1.5 block text-xs font-medium text-fg-muted"
          >
            Role
          </label>
          <Select
            id="add-user-role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as Role);
            }}
            className="h-9 w-32"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </Select>
        </div>
        <div className="flex h-9 items-center gap-2">
          <FulfillmentToggle
            checked={fulfillmentAccess}
            label="Fulfillment access"
            onCheckedChange={setFulfillmentAccess}
          />
          <span className="text-sm text-fg-secondary">Fulfillment access</span>
        </div>
        <Button type="submit" size="sm" className="h-9" disabled={isPending}>
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Adding…" : "Add user"}
        </Button>
      </form>
    </Card>
  );
}
