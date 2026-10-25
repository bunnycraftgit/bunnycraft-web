import { NextResponse } from "next/server";

import { Category, countOf } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validations/admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const categories = await Category.findAll({
    attributes: { include: [[countOf("Product", "categoryId", "Category"), "productCount"]] },
    order: [["name", "ASC"]],
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const existing = await Category.findOne({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
  }

  const category = await Category.create(parsed.data);
  return NextResponse.json(category);
}
