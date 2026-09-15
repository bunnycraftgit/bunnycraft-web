// Shim — the real Prisma client singleton now lives in packages/db. This
// re-export exists purely so the old (soon to be dismantled) monolith app's
// existing "@/lib/prisma" imports keep working unmodified during the
// Multi-Zones migration; the two new apps import "@bunnycraft/db" directly.
export * from "@bunnycraft/db";
