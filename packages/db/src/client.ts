import mysql2 from "mysql2";
import { Sequelize } from "sequelize";

const globalForSequelize = globalThis as unknown as {
  sequelize: Sequelize | undefined;
};

function createSequelize() {
  // Falls back to a placeholder so importing this module never throws (e.g.
  // during `next build` without env vars). Queries then fail, and the data
  // helpers in @bunnycraft/shared fall back to static catalog data.
  const url = process.env.DATABASE_URL ?? "mysql://root@localhost:3306/bunnycraft";

  return new Sequelize(url, {
    dialect: "mysql",
    // Passed explicitly so bundlers never have to resolve Sequelize's
    // dynamic `require(dialect)`.
    dialectModule: mysql2,
    dialectOptions: {
      // DECIMAL columns come back as JS numbers instead of strings.
      decimalNumbers: true,
    },
    // The schema was originally created by Prisma, which stores DateTime in UTC.
    timezone: "+00:00",
    logging: process.env.DB_LOG === "true" ? console.log : false,
    define: {
      // Table names match the model names exactly (User, Product, …).
      freezeTableName: true,
    },
    pool: { max: 10, min: 0, idle: 10_000 },
  });
}

export const sequelize = globalForSequelize.sequelize ?? createSequelize();

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
