const fs = require("fs");
const cp = require("child_process");

const agents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const results = {};

for (const i of agents) {
  try {
    cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    
    const testCode = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";
test("test", () => {
  expect(() => {
    z.string().default(() => "hello", { skipEncoding: true });
  }).toThrow();
});
`;
    fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testCode);
    try {
      cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
      results[i] = "PASS";
    } catch (e) {
      results[i] = "FAIL";
    }
  } catch (e) {
    results[i] = "ERROR";
  }
}

console.log("Factory + skipEncoding toThrow result:");
console.log(JSON.stringify(results, null, 2));
