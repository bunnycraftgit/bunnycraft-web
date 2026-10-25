import { NextResponse } from "next/server";
import { z } from "zod";

import { Product, sequelize } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["feature", "unfeature", "delete", "setCategory"]),
  categoryId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { ids, action, categoryId } = parsed.data;

  if (action === "delete") {
    // All-or-nothing: if any product is still referenced, none are deleted.
    const count = await sequelize
      .transaction((transaction) => Product.destroy({ where: { id: ids }, transaction }))
      .catch(() => null);
    if (count === null) {
      return NextResponse.json(
        { error: "Some products have existing orders, reviews, or wishlist saves and can't be deleted." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true, count });
  }

  if (action === "setCategory") {
    if (!categoryId) {
      return NextResponse.json({ error: "A category is required." }, { status: 400 });
    }
    const [count] = await Product.update({ categoryId }, { where: { id: ids } });
    return NextResponse.json({ ok: true, count });
  }

  const [count] = await Product.update(
    { featured: action === "feature" },
    { where: { id: ids } }
  );
  return NextResponse.json({ ok: true, count });
}
