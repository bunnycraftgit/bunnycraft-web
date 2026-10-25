import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { Address } from "@bunnycraft/db";
import { shippingAddressSchema } from "@/lib/validations/order";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json([]);
  }

  const addresses = await Address.findAll({
    where: { userId: session.user.id },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = shippingAddressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address." },
      { status: 400 }
    );
  }

  const existingCount = await Address.count({ where: { userId: session.user.id } });

  const address = await Address.create({
    ...parsed.data,
    userId: session.user.id,
    isDefault: existingCount === 0,
  });

  return NextResponse.json(address);
}
