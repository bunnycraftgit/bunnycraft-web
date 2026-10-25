import type { QueryInterface, Sequelize } from "sequelize";
import { SequelizeStorage, Umzug, type MigrationParams } from "umzug";

import { sequelize } from "./client";
import "./models";
import * as baseline from "./migrations/0001-baseline";
import * as catchUpColumns from "./migrations/0002-catch-up-columns";
import * as dropRazorpayColumns from "./migrations/0003-drop-razorpay-columns";

type MigrationModule = { up: Migration; down: Migration };

// Listed explicitly (rather than globbed from disk) so the order is obvious
// and nothing depends on file-system layout. Append new migrations here.
const MIGRATIONS: [string, MigrationModule][] = [
  ["0001-baseline", baseline],
  ["0002-catch-up-columns", catchUpColumns],
  ["0003-drop-razorpay-columns", dropRazorpayColumns],
];

type MigrationContext = { sequelize: Sequelize; queryInterface: QueryInterface };

export type Migration = (params: MigrationParams<MigrationContext>) => Promise<unknown>;

const context: MigrationContext = { sequelize, queryInterface: sequelize.getQueryInterface() };

export const migrator = new Umzug<MigrationContext>({
  migrations: MIGRATIONS.map(([name, m]) => ({
    name,
    up: (params) => m.up(params),
    down: (params) => m.down(params),
  })),
  context,
  storage: new SequelizeStorage({ sequelize, tableName: "SequelizeMeta" }),
  logger: console,
});
