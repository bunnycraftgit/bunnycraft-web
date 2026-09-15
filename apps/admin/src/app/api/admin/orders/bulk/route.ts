import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.enum(["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const result = await prisma.order.updateMany({
    where: { id: { in: parsed.data.ids } },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true, count: result.count });
}
