import { NextResponse } from "next/server";

import { getProducts } from "@/lib/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await getProducts({ q });

  return NextResponse.json(
    products.slice(0, 6).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      price: p.price,
    }))
  );
}
