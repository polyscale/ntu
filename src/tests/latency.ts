import { Stats } from "fast-stats";
import { createConnection, SupportedProtocol, request } from "../lib/request";
import { logSameLine } from "../lib/stdout";
import type { RunTestArgs } from "./main";

export type LatencyTestResult = {
  requests: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
};

const MAX_REQUESTS = 100;

async function* gen(args: RunTestArgs) {
  const connection = args.query
    ? await createConnection(args.protocol, args)
    : undefined;

  for (let i = 0; i < MAX_REQUESTS; i++) {
    // eslint-disable-next-line no-await-in-loop
    const execTime = await request({
      protocol: args.protocol,
      args: {
        ...args,
        connection: connection?.connection,
      },
    });
    logSameLine(`Request: ${i + 1}/${MAX_REQUESTS}`);

    yield execTime;
  }

  if (connection) {
    await connection.close();
  }

  console.log("\n");
}

export const latencyTest = async (args: RunTestArgs) => {
  const t = new Stats();
  for await (const execTime of gen(args)) {
    t.push(execTime);
  }

  const result: LatencyTestResult = {
    requests: MAX_REQUESTS,
    median: t.median(),
    p90: t.percentile(90),
    p95: t.percentile(95),
    p99: t.percentile(99),
  };

  return result;
};
