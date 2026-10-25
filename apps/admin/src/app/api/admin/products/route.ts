import { NextResponse } from "next/server";

import { Category, Product } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/validations/admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const products = await Product.findAll({
    include: [{ model: Category, as: "category" }],
    order: [["createdAt", "DESC"]],
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const existing = await Product.findOne({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
  }

  const product = await Product.create(parsed.data);
  return NextResponse.json(product);
}
