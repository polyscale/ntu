import { IncomingWebhook } from "@slack/webhook";
import type { TestResult } from "../tests/main";
import { reportLatencyTestResult } from "./latency";
import { reportLoadTestResult } from "./load";

export const reportTestResult = async (
  result: TestResult,
  args: { target: string; slackWebhook?: string }
) => {
  let slack: IncomingWebhook | undefined;

  if (args.slackWebhook) {
    slack = new IncomingWebhook(args.slackWebhook);
  }

  switch (result.type) {
    case "latency": {
      return reportLatencyTestResult(result.result, { slack });
    }

    case "load": {
      return reportLoadTestResult(result.result, { slack });
    }

    default:
  }
};
