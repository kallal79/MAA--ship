const fs = require("fs");
const cp = require("child_process");

const code = `
import { expect, test } from "vitest";
import { util } from "./packages/zod/src/v4/core/util.ts";

console.log("typeof deepEqual is:", typeof util.deepEqual);
console.log("typeof shallowEqual is:", typeof util.shallowEqual);
`;
fs.writeFileSync("test-util.ts", code);

try {
  const out = cp.execSync("pnpm vitest run test-util.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe"}).toString();
  console.log(out);
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log(stdout.substring(0, 2000));
}
