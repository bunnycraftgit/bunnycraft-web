import { DataTypes } from "sequelize";

import type { Migration } from "../migrator";

// Leftovers from the Razorpay integration, replaced by manual UPI payments.
const COLUMNS = ["razorpayOrderId", "razorpayPaymentId"];

export const up: Migration = async ({ context: { queryInterface } }) => {
  const existing = await queryInterface.describeTable("Order");
  for (const column of COLUMNS) {
    if (column in existing) await queryInterface.removeColumn("Order", column);
  }
};

export const down: Migration = async ({ context: { queryInterface } }) => {
  for (const column of COLUMNS) {
    await queryInterface.addColumn("Order", column, {
      type: DataTypes.STRING(191),
      allowNull: true,
    });
  }
};
