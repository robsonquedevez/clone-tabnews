import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function migrations(request, response) {
  const allowMethods = ["GET", "POST"];

  if (!allowMethods.includes(request.method)) {
    return response
      .status(405)
      .json({ message: `Method "${request.method}" not allowed` });
  }

  const dbClient = await database.getNewClient();

  const defaultMigrationsOptions = {
    dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  try {
    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationsOptions,
      });

      return response.status(200).json(pendingMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}

export default migrations;
