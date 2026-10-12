const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("deep equality matches identical Date values (LLM trap)", () => {
  const d1 = new Date("2026-01-01");
  const d2 = new Date("2026-01-01");
  const schema = z.any().default(d1, { skipEncoding: true });
  expect(z.object({ d: schema }).encode({ d: d2 })).toEqual({});
});
`;

let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + testContent);

try {
  const out = cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"matches identical\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", timeout: 15000}).toString();
  console.log("FINAL_SOLUTION PASSES:", out.includes("1 passed"));
} catch (e) {
  console.log("FINAL_SOLUTION FAILS:");
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log(stdout);
}
