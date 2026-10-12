const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_8/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("discriminator: Set bipartite matching negative", () => {
  const O1 = { val: 1 };
  const O1_COPY = { val: 1 };
  const O2 = { val: 2 };
  
  const a = new Set([ O1, O1_COPY ]);
  const b = new Set([ O1, O2 ]);
  
  const schema = z.any().default(a, { skipEncoding: true });
  const result = z.object({ a: schema }).encode({ a: b });
  throw new Error("RESULT_KEYS: " + Object.keys(result).join(","));
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
