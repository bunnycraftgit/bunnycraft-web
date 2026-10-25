import type { Migration } from "../migrator";

// Baseline for databases created by the old Prisma schema (or empty ones).
// `sync()` without `alter` only issues CREATE TABLE IF NOT EXISTS, so it
// creates any missing tables from the current models and never touches
// existing tables or data. Later migrations must therefore be idempotent:
// on a fresh database this baseline already creates the latest columns.
export const up: Migration = async ({ context: { sequelize } }) => {
  await sequelize.sync();
};

export const down: Migration = async () => {
  // Intentionally irreversible — dropping every table is never what you want.
};
