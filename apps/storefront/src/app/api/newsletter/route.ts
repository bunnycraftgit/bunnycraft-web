import { NextResponse } from "next/server";
import { z } from "zod";

import { NewsletterSubscriber } from "@bunnycraft/db";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  await NewsletterSubscriber.findOrCreate({
    where: { email: parsed.data.email },
    defaults: { email: parsed.data.email },
  });

  return NextResponse.json({ ok: true });
}
