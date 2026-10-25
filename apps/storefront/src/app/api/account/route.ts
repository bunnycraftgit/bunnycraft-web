import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { User } from "@bunnycraft/db";

const schema = z.object({
  name: z.string().min(2).max(80),
  image: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  }

  await User.update(
    {
      name: parsed.data.name,
      ...(parsed.data.image !== undefined ? { image: parsed.data.image } : {}),
    },
    { where: { id: session.user.id } }
  );

  return NextResponse.json({ ok: true });
}
