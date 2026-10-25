import {
  ORDER_STATUSES,
  Op,
  contains,
  literal,
  sequelize,
  type OrderStatus,
  type WhereOptions,
} from "@bunnycraft/db";

export type OrderFilterParams = {
  q?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

const STATUSES = new Set<string>(ORDER_STATUSES);

export function buildOrderWhere(sp: OrderFilterParams): WhereOptions {
  const where: Record<string | symbol, unknown> = {};

  if (sp.q) {
    // Customer name/email live on User. Matching them through a subquery
    // (rather than `$user.email$`) keeps this usable alongside a paginated
    // `items` include, which Sequelize wraps in its own subquery.
    const pattern = sequelize.escape(`%${sp.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
    where[Op.or] = [
      { shippingName: contains(sp.q) },
      { guestEmail: contains(sp.q) },
      {
        userId: {
          [Op.in]: literal(
            `(SELECT \`id\` FROM \`User\` WHERE \`email\` LIKE ${pattern} OR \`name\` LIKE ${pattern})`
          ),
        },
      },
    ];
  }

  if (sp.status && STATUSES.has(sp.status)) {
    where.status = sp.status as OrderStatus;
  }

  if (sp.dateFrom || sp.dateTo) {
    where.createdAt = {
      ...(sp.dateFrom ? { [Op.gte]: new Date(sp.dateFrom) } : {}),
      ...(sp.dateTo ? { [Op.lte]: new Date(`${sp.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  return where as WhereOptions;
}
