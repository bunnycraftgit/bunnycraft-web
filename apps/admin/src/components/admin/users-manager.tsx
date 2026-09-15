"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";

type Role = "CUSTOMER" | "ADMIN";
type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  orderCount: number;
};
type Meta = { page: number; pageCount: number; total: number; pageSize: number };

export function UsersManager({
  initial,
  currentUserId,
  meta,
}: {
  initial: User[];
  currentUserId: string | null;
  meta: Meta;
}) {
  const router = useRouter();
  const [users, setUsers] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setUsers(initial);
  }

  async function updateRole(id: string, role: Role) {
    const prev = users;
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).catch(() => null);
    if (!res?.ok) {
      setUsers(prev);
      const data = res ? await res.json().catch(() => null) : null;
      toast.error(data?.error ?? "Couldn't update that user's role.");
    } else {
      toast.success("Role updated.");
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(data?.error ?? "Couldn't delete that user.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User deleted.");
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">Users</h2>
      <div className="mb-4">
        <AdminSearchBar placeholder="Search name or email…" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name ?? "—"}
                    {isSelf && (
                      <Badge variant="outline" className="ml-2">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.orderCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      disabled={isSelf}
                      onValueChange={(v) => updateRole(u.id, v as Role)}
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <button
                        onClick={() => remove(u.id)}
                        disabled={isSelf}
                        className="text-muted-foreground hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <AdminPagination {...meta} />
      </div>
    </div>
  );
}
