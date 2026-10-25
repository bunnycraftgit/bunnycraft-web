import { Op, type ModelStatic, type Model } from "sequelize";

import { sequelize } from "./client";

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Case-insensitive (default MySQL collation) substring match, like Prisma's `contains`. */
export function contains(value: string) {
  return { [Op.like]: `%${escapeLike(value)}%` };
}

/** Like Prisma's `endsWith`. */
export function endsWith(value: string) {
  return { [Op.like]: `%${escapeLike(value)}` };
}

/**
 * A correlated `COUNT(*)` subquery for use as an attribute, replacing
 * Prisma's `_count`. e.g. `[countOf("Product", "categoryId", "Category"), "productCount"]`
 */
export function countOf(childTable: string, foreignKey: string, parentAlias: string) {
  const q = (name: string) => sequelize.getQueryInterface().quoteIdentifier(name);
  return sequelize.literal(
    `(SELECT COUNT(*) FROM ${q(childTable)} WHERE ${q(childTable)}.${q(foreignKey)} = ${q(parentAlias)}.${q("id")})`
  );
}

/**
 * Updates a row by primary key and returns it, or `null` when no row has
 * that id (Prisma's `update` threw instead).
 */
export async function updateByPk<M extends Model>(
  model: ModelStatic<M>,
  id: string | number,
  values: Partial<M["_attributes"]>
): Promise<M | null> {
  const row = await model.findByPk(id);
  if (!row) return null;
  await row.update(values);
  return row;
}

export { Op };
