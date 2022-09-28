import { clearLine, cursorTo } from "node:readline";
import { stdout } from "node:process";

export const logSameLine = (line: string) => {
  clearLine(stdout, 0);
  cursorTo(stdout, 0);
  stdout.write(line);
};
