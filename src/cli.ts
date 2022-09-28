#!/usr/bin/env node

import { argv, exit, setUncaughtExceptionCaptureCallback } from "node:process";
import yargs from "yargs/yargs";
import { getProtocol, parseUrl } from "./lib/url";
import { reportTestResult } from "./reporting/main";
import { runTest } from "./tests/main";

setUncaughtExceptionCaptureCallback((error) => {
  console.log(error.message);
  exit(1);
});

const main = async () => {
  const args = await yargs(argv.slice(2))
    .scriptName("ntu")
    .usage("$0 [args] <cmd>")
    .demandCommand()
    .options({
      "slack-webhook": {
        type: "string",
        alias: "sw",
        description: "Send results to a Slack channel",
      },
      query: {
        type: "string",
        alias: "q",
        describe: "SQL query for SQL targets",
      },
      target: {
        type: "string",
        alias: "t",
        demandOption: true,
        describe: "i.e. [http|https|tcp]://[hostname]:[port]",
      },
    })
    .command("latency", "run a latency test against the target")
    .command("load", "run a load test against the target")
    .help()
    .parseAsync();

  switch (args._[0]) {
    case "load":
    case "latency": {
      const result = await runTest(args._[0], {
        protocol: getProtocol(args.target),
        target: parseUrl(args.target),
      });

      await reportTestResult(result, {
        target: args.target,
        slackWebhook: args.slackWebhook,
      });

      break;
    }

    default: {
      throw new Error("Unsupported test type");
    }
  }
};

void main();
