import type { IncomingWebhook } from "@slack/webhook";
import type { LatencyTestResult } from "../tests/latency";

export const reportLatencyTestResult = async (
  result: LatencyTestResult,
  reportTargets: { slack?: IncomingWebhook }
) => {
  console.table(result);

  await reportTargets.slack?.send({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*ntu – latency – result*`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Total Requests:* ${result.requests}`,
          },
          {
            type: "mrkdwn",
            text: `*Median:* ${result.median}`,
          },
          {
            type: "mrkdwn",
            text: `*P90:* ${result.p90}`,
          },
          {
            type: "mrkdwn",
            text: `*P95:* ${result.p95}`,
          },
          {
            type: "mrkdwn",
            text: `*P99:* ${result.p99}`,
          },
        ],
      },
    ],
  });
};
