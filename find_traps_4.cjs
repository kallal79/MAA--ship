const fs = require("fs");
const { execSync } = require("child_process");

const TRAPS = `
import { expect, test } from "vitest";
import { z } from "../index.js";

test("TRAP16_SHALLOW_MAP", () => {
  const a = new Map([["a", 1]]);
  const schema = z.any().default(a, { skipEncoding: { mode: "shallow" } });
  expect(z.object({ f: schema }).encode({ f: new Map([["a", 1]]) })).toEqual({});
});

test("TRAP17_SHALLOW_SET", () => {
  const a = new Set(["a"]);
  const schema = z.any().default(a, { skipEncoding: { mode: "shallow" } });
  expect(z.object({ f: schema }).encode({ f: new Set(["a"]) })).toEqual({});
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
    if (e.stdout) {
      try {
        const json = JSON.parse(e.stdout.toString());
        results[i] = json.testResults[0].assertionResults.map(r => r.title + ": " + r.status);
      } catch (err) {
        results[i] = ["CRASH"];
      }
    } else {
      results[i] = ["TIMEOUT"];
    }
  }
}

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/trap_results_4.json", JSON.stringify(results, null, 2));
