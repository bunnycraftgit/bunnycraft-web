import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { Address, Op } from "@bunnycraft/db";
import { shippingAddressSchema } from "@/lib/validations/order";

const patchSchema = shippingAddressSchema.partial().extend({
  isDefault: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const address = await Address.findByPk(id);
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await Address.update(
      { isDefault: false },
      { where: { userId: session.user.id, id: { [Op.ne]: id } } }
    );
  }

  await address.update(parsed.data);
  return NextResponse.json(address);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const address = await Address.findByPk(id);
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  await address.destroy();
  return NextResponse.json({ ok: true });
}
