const fs = require("fs");
const { execSync } = require("child_process");

const TRAPS = `
import { expect, test } from "vitest";
import { z } from "../index.js";

test("TRAP12_MAP_CYCLE", () => {
  const a = new Map(); a.set(a, 1);
  const b = new Map(); b.set(b, 1);
  const schema = z.any().default(a, { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: b })).toEqual({});
});

test("TRAP13_SET_CYCLE", () => {
  const a = new Set(); a.add(a);
  const b = new Set(); b.add(b);
  const schema = z.any().default(a, { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: b })).toEqual({});
});

test("TRAP14_SPARSE_UNDEFINED_EQUAL", () => {
  const a = [1, undefined, 2];
  const b = [1, undefined, 2];
  const schema = z.any().default(a, { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: b })).toEqual({});
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

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/trap_results_2.json", JSON.stringify(results, null, 2));
