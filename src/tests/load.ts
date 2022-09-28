import { Stats } from "fast-stats";
import { createConnection, request } from "../lib/request";
import { logSameLine } from "../lib/stdout";
import type { RunTestArgs } from "./main";

type LoadTestResultPartial = {
  successMedian: number;
  successAmean: number;
  successRange: number[];
  successRequests: number;
  errorMedian?: number;
  errorAmean?: number;
  errorRange?: number[];
  errorRequests: number;
  totalRequests: number;
  concurrentRequests: number;
};

export type LoadTestResult = Record<number, LoadTestResultPartial>;

const concurrencyLevels = [1, 5, 20, 50, 100, 250, 500, 1000];

export const iterations = 2;

const updateLog = (concurrency: number, iteration: number) => {
  logSameLine(`Level: ${concurrency} Iteration: ${iteration}`);
};

async function runConcurrentRequests({
  args,
  concurrencyLevel,
}: {
  args: RunTestArgs;
  concurrencyLevel: number;
}) {
  const connection = args.query
    ? await createConnection(args.protocol, args)
    : undefined;

  const results = await Promise.all(
    Array.from({ length: concurrencyLevel }).map(async () => {
      const t = Date.now();
      let d: number;
      let status: "success" | "error";
      try {
        await request({
          protocol: args.protocol,
          args: {
            ...args,
            connection: connection?.connection,
          },
        });
        d = Date.now() - t;
        status = "success";
      } catch {
        d = Date.now() - t;
        status = "error";
      }

      return {
        type: status,
        execTime: d,
      };
    })
  );

  if (connection) {
    await connection.close();
  }

  return results;
}

async function* produceExecutionTimes(args: RunTestArgs) {
  for (const concurrencyLevel of concurrencyLevels) {
    const allSuccessExecTimes = [];
    const allErrorExecTimes = [];

    for (let i = 0; i < iterations; i++) {
      updateLog(concurrencyLevel, i + 1);
      // eslint-disable-next-line no-await-in-loop
      const execTimes = await runConcurrentRequests({
        concurrencyLevel,
        args,
      });

      const successExecTimes = execTimes
        .filter((d) => d.type === "success")
        .map((d) => d.execTime);
      const errorExecTimes = execTimes
        .filter((d) => d.type === "error")
        .map((d) => d.execTime);

      allSuccessExecTimes.push(...successExecTimes);
      allErrorExecTimes.push(...errorExecTimes);
    }

    yield { concurrencyLevel, allSuccessExecTimes, allErrorExecTimes };
  }
}

export const loadTest = async (args: RunTestArgs) => {
  const results: LoadTestResult = {};
  for await (const {
    concurrencyLevel,
    allSuccessExecTimes,
    allErrorExecTimes,
  } of produceExecutionTimes(args)) {
    const successStats = new Stats();
    const errorStats = new Stats();

    successStats.push(...allSuccessExecTimes);
    errorStats.push(...allErrorExecTimes);

    const result = {
      successMedian: successStats.median(),
      successAmean: successStats.amean(),
      successRange: successStats.range(),
      successRequests: successStats.length,
      errorMedian: errorStats.length > 0 ? errorStats.median() : undefined,
      errorAmean: errorStats.length > 0 ? errorStats.amean() : undefined,
      errorRange: errorStats.length > 0 ? errorStats.range() : undefined,
      errorRequests: errorStats.length,
      totalRequests: successStats.length + errorStats.length,
      concurrentRequests: concurrencyLevel,
    };

    results[concurrencyLevel] = result;
  }

  console.log("");

  return results;
};
