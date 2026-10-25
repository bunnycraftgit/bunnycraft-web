import { NextResponse } from "next/server";

import { NewsletterSubscriber } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const subscribers = await NewsletterSubscriber.findAll({ order: [["createdAt", "DESC"]] });
  return NextResponse.json(subscribers);
}
