"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, MoreHorizontal, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  removeDashboardUser,
  updateDashboardUser,
} from "@/lib/actions/admin-users";
import type { Role } from "@/lib/auth/role";
import type { DashboardUser } from "@/lib/sources/bot/admin-users";
import { FulfillmentToggle } from "./fulfillment-toggle";
import { RoleBadge } from "./role-badge";

const ROLE_OPTIONS: readonly { role: Role; label: string }[] = [
  { role: "admin", label: "Admin" },
  { role: "editor", label: "Editor" },
  { role: "viewer", label: "Viewer" },
];

export function UsersTable({
  users,
  currentEmail,
}: {
  users: DashboardUser[];
  currentEmail: string | null;
}): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<DashboardUser | null>(null);

  const sorted = [...users].sort((a, b) =>
    a.isRoot !== b.isRoot
      ? Number(b.isRoot) - Number(a.isRoot)
      : a.email.localeCompare(b.email),
  );

  const mutate = (
    email: string,
    run: () => Promise<{ ok: boolean; error: string | null }>,
    successMessage: string,
  ): void => {
    setBusyEmail(email);
    startTransition(async () => {
      const result = await run();
      setBusyEmail(null);
      if (!result.ok) {
        toast.error("Update failed", { description: result.error });
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  };

  const onSetRole = (user: DashboardUser, role: Role): void => {
    mutate(
      user.email,
      () => updateDashboardUser(user.email, { role }),
      `${user.email} is now ${role}`,
    );
  };

  const onToggleFulfillment = (user: DashboardUser, next: boolean): void => {
    mutate(
      user.email,
      () => updateDashboardUser(user.email, { fulfillmentAccess: next }),
      `Fulfillment access ${next ? "granted to" : "removed from"} ${user.email}`,
    );
  };

  const onConfirmRemove = (): void => {
    if (removeTarget === null) return;
    const target = removeTarget;
    setRemoveTarget(null);
    mutate(
      target.email,
      () => removeDashboardUser(target.email),
      `Removed ${target.email}`,
    );
  };

  return (
    <Card className="border-glass-border bg-glass">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Fulfillment</TableHead>
            <TableHead>Added by</TableHead>
            <TableHead className="w-12 text-right" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-fg-muted">
                No users yet — add the first one above.
              </TableCell>
            </TableRow>
          )}
          {sorted.map((user) => {
            const isBusy = isPending && busyEmail === user.email;
            return (
              <TableRow key={user.email}>
                <TableCell>
                  <span className="font-medium text-fg-primary">
                    {user.email}
                  </span>
                  {currentEmail !== null && user.email === currentEmail && (
                    <span className="ml-2 text-xs text-fg-muted">(you)</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role} />
                    {user.isRoot && (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-fg-muted"
                        title="Root admin — cannot be demoted or removed"
                      >
                        <Lock className="h-3 w-3" />
                        Root
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <FulfillmentToggle
                    checked={user.fulfillmentAccess}
                    disabled={user.isRoot || isBusy}
                    label={`Fulfillment access for ${user.email}`}
                    onCheckedChange={(next) => {
                      onToggleFulfillment(user, next);
                    }}
                  />
                </TableCell>
                <TableCell className="text-fg-muted">
                  {user.addedBy ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {user.isRoot ? (
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center text-fg-subtle"
                      title="Root admin — cannot be demoted or removed"
                    >
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isBusy}
                          aria-label={`Actions for ${user.email}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-fg-muted">
                          <UserCog className="h-3.5 w-3.5" />
                          Change role
                        </DropdownMenuLabel>
                        {ROLE_OPTIONS.map(({ role, label }) => (
                          <DropdownMenuItem
                            key={role}
                            disabled={role === user.role}
                            onSelect={() => {
                              onSetRole(user, role);
                            }}
                          >
                            {label}
                            {role === user.role && (
                              <span className="ml-auto text-xs text-fg-muted">
                                current
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => {
                            setRemoveTarget(user);
                          }}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Remove user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove user</DialogTitle>
            <DialogDescription>
              {removeTarget !== null
                ? `${removeTarget.email} will immediately lose dashboard access. This does not touch any student or coach data.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRemoveTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onConfirmRemove}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
