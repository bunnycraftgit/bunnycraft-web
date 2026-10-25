import { DataTypes, type ModelAttributeColumnOptions } from "sequelize";

import { PRODUCT_STATUSES } from "../enums";
import type { Migration } from "../migrator";

// Columns added to the schema after some databases were last `prisma db
// push`ed. Each is only added when missing, so this is safe on both old and
// freshly-created databases. (The Testimonial and PaymentSettings tables
// from that period are created by the baseline when missing.)
const COLUMNS: [table: string, column: string, spec: ModelAttributeColumnOptions][] = [
  [
    "Product",
    "status",
    { type: DataTypes.ENUM(...PRODUCT_STATUSES), allowNull: false, defaultValue: "LIVE" },
  ],
  ["Product", "specifications", { type: DataTypes.JSON, allowNull: true }],
  ["Order", "paymentProofUrl", { type: DataTypes.STRING(191), allowNull: true }],
  ["Order", "paymentReference", { type: DataTypes.STRING(191), allowNull: true }],
  ["Order", "paymentSubmittedAt", { type: DataTypes.DATE(3), allowNull: true }],
];

export const up: Migration = async ({ context: { queryInterface } }) => {
  for (const [table, column, spec] of COLUMNS) {
    const existing = await queryInterface.describeTable(table);
    if (!(column in existing)) await queryInterface.addColumn(table, column, spec);
  }
};

export const down: Migration = async ({ context: { queryInterface } }) => {
  for (const [table, column] of [...COLUMNS].reverse()) {
    await queryInterface.removeColumn(table, column);
  }
};
