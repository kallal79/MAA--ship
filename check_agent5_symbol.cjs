const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_5/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("discriminator: deep equality of Symbol keys", () => {
  const sym = Symbol("test");
  const o1 = { [sym]: 1 };
  const o2 = { [sym]: 2 };
  const schema = z.any().default(o1, { skipEncoding: true });
  console.log("ENCODED:", z.object({ o: schema }).encode({ o: o2 }));
  expect(z.object({ o: schema }).encode({ o: o2 })).toEqual({ o: o2 });
});
`;

let content = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/CANDIDATE_TEST_45.ts", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", content + "\n" + testContent);

try {
  const out = cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false -t \"discriminator: deep equality of Symbol keys\"", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", env: {...process.env, CI: "true"}}).toString();
  console.log("STDOUT:", out);
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log("STDOUT(ERR):", stdout.substring(0, 2000));
}
