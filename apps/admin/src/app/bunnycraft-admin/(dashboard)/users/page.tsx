import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { UsersManager } from "@/components/admin/users-manager";
import { Op, User, contains, countOf, type WhereOptions } from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Users" };

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const where: WhereOptions = q
    ? { [Op.or]: [{ name: contains(q) }, { email: contains(q) }] }
    : {};

  const [session, users, total] = await Promise.all([
    auth(),
    User.findAll({
      where,
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "createdAt",
        [countOf("Order", "userId", "User"), "orderCount"],
      ],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    User.count({ where }),
  ]);

  const plain = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    orderCount: Number(u.get("orderCount")),
  }));

  return (
    <UsersManager
      initial={plain}
      currentUserId={session?.user?.id ?? null}
      meta={paginationMeta(page, total, PAGE_SIZE)}
    />
  );
}
