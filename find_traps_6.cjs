const fs = require("fs");
const { execSync } = require("child_process");

const TRAPS = `
import { expect, test } from "vitest";
import { z } from "../index.js";

test("TRAP21_ASYMMETRIC_CYCLE", () => {
  const a: any = {};
  a.self = a;
  const b: any = { self: {} };
  const schema = z.any().default(a, { skipEncoding: true });
  const res = z.object({ f: schema }).encode({ f: b });
  expect("f" in res).toBe(true);
});
`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/traps.spec.ts", TRAPS);

const results = {};

for (let i = 1; i <= 12; i++) {
  try {
    execSync("git reset --hard 1fb56a5c && git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
    execSync("git apply C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_" + i + "/solution-patch.patch", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    continue;
  }
  
  fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/traps.spec.ts", TRAPS);
  
  try {
    const out = execSync("pnpm vitest run packages/zod/src/v4/classic/tests/traps.spec.ts --typecheck.enabled=false --reporter=json", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", timeout: 15000}).toString();
    const json = JSON.parse(out);
    results[i] = json.testResults[0].assertionResults.map(r => r.title + ": " + r.status);
  } catch (e) {
    results[i] = ["FAILED"];
  }
}

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/trap_results_6.json", JSON.stringify(results, null, 2));
