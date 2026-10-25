import { NextResponse } from "next/server";

import { User, countOf } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const users = await User.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "createdAt",
      [countOf("Order", "userId", "User"), "orderCount"],
    ],
    order: [["createdAt", "DESC"]],
  });
  return NextResponse.json(users);
}
