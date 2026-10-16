import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@bunnycraft/db";
import { saveUploadedFile } from "@/lib/storage";
import { paymentReferenceSchema } from "@/lib/validations/order";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png"]);

// Customer uploads a screenshot of their UPI payment. The order stays
// PENDING_PAYMENT until an admin checks the screenshot and confirms it.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a screenshot of your payment." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Screenshot is too large (max 10MB)." }, { status: 400 });
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: "Upload a JPG or PNG image." }, { status: 400 });
  }

  const reference = paymentReferenceSchema.safeParse(formData?.get("reference") ?? undefined);
  if (!reference.success) {
    return NextResponse.json({ error: "Transaction ID is too long." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.userId) {
    const session = await auth();
    if (session?.user?.id !== order.userId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "This order has already been processed." }, { status: 409 });
  }

  const { url } = await saveUploadedFile(file);

  await prisma.order.update({
    where: { id },
    data: {
      paymentProofUrl: url,
      paymentReference: reference.data || null,
      paymentSubmittedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
