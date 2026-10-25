import { sequelize } from "../client";
import { migrator } from "../migrator";

async function main() {
  const command = process.argv[2] ?? "up";

  if (command === "up") {
    const ran = await migrator.up();
    console.log(ran.length ? `Applied ${ran.length} migration(s).` : "Database is up to date.");
  } else if (command === "down") {
    await migrator.down();
  } else if (command === "status") {
    const [executed, pending] = await Promise.all([migrator.executed(), migrator.pending()]);
    console.log("Executed:", executed.map((m) => m.name).join(", ") || "none");
    console.log("Pending: ", pending.map((m) => m.name).join(", ") || "none");
  } else {
    throw new Error(`Unknown command "${command}". Use up, down, or status.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
