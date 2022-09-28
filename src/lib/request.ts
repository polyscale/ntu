import net from "node:net";
import mysql2 from "mysql2/promise";
import fetch from "node-fetch";
import mssql from "mssql";
import pg from "pg";
import type { RunTestArgs } from "../tests/main";
import { createUrl } from "./url";
import { measureTime } from "./time";

export type DatabaseProtocol =
  | "mysql"
  | "mariadb"
  | "postgres"
  | "postgresql"
  | "mssql";

export type SupportedProtocol = "tcp" | "http" | "https" | DatabaseProtocol;

type RequestArgs =
  | {
      protocol: "tcp";
      args: Parameters<typeof tcpRequest>[0];
    }
  | {
      protocol: "mysql" | "mariadb";
      args: Parameters<typeof mysqlRequest>[0];
    }
  | {
      protocol: "http" | "https";
      args: Parameters<typeof httpRequest>[0];
    }
  | {
      protocol: "postgres" | "postgresql";
      args: Parameters<typeof postgresRequest>[0];
    }
  | {
      protocol: "mssql";
      args: Parameters<typeof mssqlRequest>[0];
    }
  | {
      protocol: string;
      args: any;
    };

export const createConnection = async (protocol: string, args: RunTestArgs) => {
  console.log("Establishing database connection...");

  switch (protocol) {
    case "mysql":
    case "mariadb": {
      const connection = await mysql2.createConnection(createUrl(args.target));

      return {
        connection,
        async close() {
          console.log("Closing database connection...");
          await connection.end();
        },
      };
    }

    case "postgres":
    case "postgresql": {
      const connection = new pg.Client({
        connectionString: createUrl(args.target),
      });

      await connection.connect();

      return {
        connection,
        async close() {
          console.log("Closing database connection...");

          await connection.end();
        },
      };
    }

    case "mssql": {
      const connection = await mssql.connect({
        user: args.target.username,
        password: args.target.password,
        database: args.target.pathname?.replace("/", "") ?? "",
        server: args.target.hostname ?? "",
        port: args.target.port,
      });

      return {
        connection,
        async close() {
          console.log("Closing database connection...");

          await connection.close();
        },
      };
    }

    default:
      return undefined;
  }
};

export const request = async ({ protocol, args }: RequestArgs) => {
  switch (protocol) {
    case "tcp": {
      return tcpRequest(args);
    }

    case "http":
    case "https": {
      return httpRequest(args);
    }

    case "mysql":
    case "mariadb": {
      return mysqlRequest(args);
    }

    case "postgres":
    case "postgresql": {
      return postgresRequest(args);
    }

    case "mssql": {
      return mssqlRequest(args);
    }

    default:
      throw new Error(`Unsupported Protocol: ${protocol}`);
  }
};

const httpRequest = async (args: { target: RunTestArgs["target"] }) => {
  const time = await measureTime(async () => fetch(createUrl(args.target)));

  return time.time;
};

const mysqlRequest = async (args: {
  target: RunTestArgs["target"];
  query?: string;
  connection?: mysql2.Connection;
}) => {
  const connectionUri = createUrl(args.target);

  if (args.query) {
    const connection =
      args.connection ?? (await mysql2.createConnection(connectionUri));

    const { time } = await measureTime(async () =>
      connection.query(args.query!)
    );

    if (!args.connection) {
      await connection.end();
    }

    return time;
  }

  const { returnValue, time } = await measureTime(async () =>
    mysql2.createConnection(connectionUri)
  );

  await returnValue.end();

  return time;
};

const mssqlRequest = async (args: {
  target: RunTestArgs["target"];
  query?: string;
  connection?: mssql.ConnectionPool;
}) => {
  if (args.query) {
    const connection =
      args.connection ??
      (await mssql.connect({
        user: args.target.username,
        password: args.target.password,
        database: args.target.pathname?.replace("/", "") ?? "",
        server: args.target.hostname ?? "",
        port: args.target.port,
      }));

    const { time } = await measureTime(async () =>
      connection.query(args.query!)
    );

    if (!args.connection) {
      await connection.close();
    }

    return time;
  }

  const { time, returnValue } = await measureTime(async () =>
    mssql.connect({
      user: args.target.username,
      password: args.target.password,
      database: args.target.pathname?.replace("/", "") ?? "",
      server: args.target.hostname ?? "",
      port: args.target.port,
    })
  );

  await returnValue.close();

  return time;
};

const postgresRequest = async (args: {
  target: RunTestArgs["target"];
  query?: string;
  connection?: pg.Pool;
}) => {
  const connectionString = createUrl(args.target);

  if (args.query) {
    const connection = args.connection ?? new pg.Client({ connectionString });

    if (!args.connection) {
      await connection.connect();
    }

    const { time } = await measureTime(async () =>
      connection.query(args.query!)
    );

    if (!args.connection) {
      await connection.end();
    }

    return time;
  }

  const connection = new pg.Client({ connectionString });

  const { time } = await measureTime(async () => {
    await connection.connect();
  });

  await connection.end();

  return time;
};

const tcpRequest = async (args: { target: RunTestArgs["target"] }) => {
  if (!args.target.port) {
    throw new Error("A port is required for TCP connections.");
  }

  return new Promise<number>((resolve, reject) => {
    const s = Date.now();
    const socket = net.connect(args.target.port!, args.target.hostname, () => {
      socket.end();
      resolve(Date.now() - s);
    });
    socket.on("error", (error) => {
      reject(error);
    });
  });
};
