import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { User, countOf, updateByPk } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { userRoleSchema } from "@/lib/validations/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const session = await auth();
  if (id === session?.user?.id) {
    return NextResponse.json(
      { error: "You can't change your own role." },
      { status: 400 },
    );
  }

  const parsed = userRoleSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  const updated = await updateByPk(User, id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  const user = await User.findByPk(id, {
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "createdAt",
      [countOf("Order", "userId", "User"), "orderCount"],
    ],
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const session = await auth();
  if (id === session?.user?.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 },
    );
  }

  try {
    await User.destroy({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "This user has existing orders and can't be deleted." },
      { status: 409 },
    );
  }
}
