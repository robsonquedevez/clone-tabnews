import database from "infra/database";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const databaseVersionResult = await database.query("SHOW server_version;");
    const databaseVersionValue = databaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionResult = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnectionValue =
      databaseMaxConnectionResult.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT COUNT(*)::int AS total FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].total;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionValue),
          opened_connections: databaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    const publucErrorObject = new InternalServerError({
      cause: error,
    });
    response.status(500).json(publucErrorObject);
  }
}

export default status;
