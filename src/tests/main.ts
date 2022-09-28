import type { EnvType } from "../lib/env";
import type { parseUrl } from "../lib/url";
import { createUrl } from "../lib/url";
import type { LatencyTestResult } from "./latency";
import { latencyTest } from "./latency";
import type { LoadTestResult } from "./load";
import { loadTest } from "./load";

export type TestResult =
  | {
      type: "load";
      result: LoadTestResult;
    }
  | {
      type: "latency";
      result: LatencyTestResult;
    };

export type RunTestArgs = {
  protocol: string;
  target: ReturnType<typeof parseUrl>;
  query?: string;
};

export const runTest = async (type: EnvType["TEST"], args: RunTestArgs) => {
  console.log(`Test: ${type}`);
  console.log(`Target: ${createUrl(args.target)}`);

  if (args.query) {
    console.log(args.query);
  }

  switch (type) {
    case "load":
      return {
        type,
        result: await loadTest(args),
      };

    case "latency":
      return {
        type,
        result: await latencyTest(args),
      };
  }
};
