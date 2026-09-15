import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@bunnycraft/db";
import { verifyRazorpaySignature } from "@/lib/payment";
import { verifyPaymentSchema } from "@/lib/validations/order";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = verifyPaymentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

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

  if (order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: "Payment details don't match this order." }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: { status: "PROCESSING", razorpayPaymentId },
  });

  return NextResponse.json({ ok: true });
}
