// Read-only sanity check: compares every model's columns with the live
// database and runs a SELECT through each model. Writes nothing.
import { sequelize } from "../client";
import * as models from "../models";

async function main() {
  const qi = sequelize.getQueryInterface();
  const tables = new Set(
    ((await qi.showAllTables()) as (string | { tableName: string })[]).map((t) =>
      // Lowercased: MySQL on Windows/macOS defaults to lower_case_table_names=1.
      (typeof t === "string" ? t : t.tableName).toLowerCase()
    )
  );
  let problems = 0;

  for (const model of Object.values(sequelize.models)) {
    const table = model.getTableName() as string;
    if (!tables.has(table.toLowerCase())) {
      console.log(`✗ ${table}: table missing (run db:migrate)`);
      problems++;
      continue;
    }
    const live = await qi.describeTable(table);
    const missing = Object.keys(model.getAttributes()).filter((c) => !(c in live));
    const extra = Object.keys(live).filter((c) => !(c in model.getAttributes()));
    if (missing.length) problems++;
    console.log(
      `${missing.length ? "✗" : "✓"} ${table}` +
        (missing.length ? `  missing columns: ${missing.join(", ")}` : "") +
        (extra.length ? `  (unmapped db columns: ${extra.join(", ")})` : "")
    );
    if (!missing.length) await model.findOne();
  }

  const { Product, Category, Order, OrderItem, User } = models;
  if (!problems) {
    await Product.findOne({ include: [{ model: Category, as: "category" }] });
    await Order.findAll({
      include: [
        { model: OrderItem, as: "items" },
        { model: User, as: "user", attributes: ["name", "email"] },
      ],
      limit: 2,
    });
    console.log("✓ association queries");
  }
  console.log(problems ? `\n${problems} problem(s).` : "\nSchema matches.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
