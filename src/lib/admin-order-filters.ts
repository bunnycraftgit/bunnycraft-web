import type { Prisma, OrderStatus } from "@prisma/client";

export type OrderFilterParams = {
  q?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

const STATUSES = new Set(["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

export function buildOrderWhere(sp: OrderFilterParams): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (sp.q) {
    where.OR = [
      { shippingName: { contains: sp.q } },
      { guestEmail: { contains: sp.q } },
      { user: { email: { contains: sp.q } } },
      { user: { name: { contains: sp.q } } },
    ];
  }

  if (sp.status && STATUSES.has(sp.status)) {
    where.status = sp.status as OrderStatus;
  }

  if (sp.dateFrom || sp.dateTo) {
    where.createdAt = {
      ...(sp.dateFrom ? { gte: new Date(sp.dateFrom) } : {}),
      ...(sp.dateTo ? { lte: new Date(`${sp.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  return where;
}
