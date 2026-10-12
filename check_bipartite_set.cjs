const fs = require("fs");
const cp = require("child_process");

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

  const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("discriminator: Set bipartite matching", () => {
  const O1 = { val: 1 };
  const O2 = { val: 2 };
  const O1_COPY = { val: 1 };
  const O2_COPY = { val: 2 };
  const a = [ new Set([ O1, O2_COPY ]), O1 ];
  const b = [ new Set([ O2, O1_COPY ]), O2 ];
  
  const schema = z.any().default(a, { skipEncoding: true });
  expect(z.object({ a: schema }).encode({ a: b })).toEqual({ a: b });
});
`;

  let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
  fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + testContent);

  try {
    cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"discriminator: Set bipartite matching\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe"});
    results[i] = "PASS";
  } catch (e) {
    results[i] = "FAIL";
  }
}
console.log("Bipartite Set:", JSON.stringify(results, null, 2));
