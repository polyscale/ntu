import type { IncomingWebhook } from "@slack/webhook";
import type { LoadTestResult } from "../tests/load";

export const reportLoadTestResult = async (
  result: LoadTestResult,
  reportTargets: { slack?: IncomingWebhook }
) => {
  console.table(result);

  await reportTargets.slack?.send({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*ntu – load – result*`,
        },
      },
      ...Object.values(result)
        .sort((a, b) => a.concurrentRequests - b.concurrentRequests)
        .flatMap((d) => [
          {
            type: "context",
            elements: [
              //   {
              //     type: "mrkdwn",
              //     text: `*Status:* ${d.errorRequests > 0 ? "🚫" : "✅"}`,
              //   },
              {
                type: "mrkdwn",
                text: `*Concurrent Requests:* ${d.concurrentRequests}`,
              },
              {
                type: "mrkdwn",
                text: `*Total Requests:* ${d.totalRequests}`,
              },
              {
                type: "mrkdwn",
                text: `*Success Requests:* ${d.successRequests}`,
              },
              {
                type: "mrkdwn",
                text: `*Success Median:* ${d.successMedian}`,
              },
              {
                type: "mrkdwn",
                text: `*Success Amean:* ${d.successAmean}`,
              },
              {
                type: "mrkdwn",
                text: `*Success Range:* ${JSON.stringify(d.successRange)}`,
              },
              {
                type: "mrkdwn",
                text: `*Error Requests:* ${d.errorRequests}`,
              },
              {
                type: "mrkdwn",
                text: `*Error Median:* ${d.errorMedian ?? ""}`,
              },
              {
                type: "mrkdwn",
                text: `*Error Amean:* ${d.errorAmean ?? ""}`,
              },
              {
                type: "mrkdwn",
                text: `*Error Range:* ${
                  d.errorRange ? JSON.stringify(d.errorRange) : ""
                }`,
              },
            ],
          },
          {
            type: "divider",
          },
        ]),
    ],
  });
};
