import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Per-route admin guard for /api/admin/* handlers. The proxy only redirects
 * page navigation to /admin (a 307 to /login would break `fetch` callers),
 * so API routes authorize themselves directly.
 */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { session: null, response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { session, response: null };
}
