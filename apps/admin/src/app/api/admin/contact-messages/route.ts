import { NextResponse } from "next/server";

import { ContactMessage } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const messages = await ContactMessage.findAll({ order: [["createdAt", "DESC"]] });
  return NextResponse.json(messages);
}
