const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("print encode result", () => {
  const schema = z.any().default(1, { skipEncoding: true });
  const result = schema._zod.run({ value: 1, issues: [] }, { direction: "backward", async: false, skipChecks: false, _schema: schema });
  console.log("RESULT_OMITTED_EXPLICIT:", result.omitted);
  throw new Error("RESULT_OMITTED_EXPLICIT: " + result.omitted);
});
`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testContent);

try {
  const out = cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", env: {...process.env, CI: "true"}}).toString();
  console.log("STDOUT:\n", out);
} catch (e) {
  const stderr = e.stderr ? e.stderr.toString() : "";
  console.log("STDERR:\n", stderr.substring(0, 2000));
}
