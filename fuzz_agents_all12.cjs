const fs = require("fs");
const cp = require("child_process");

const tests = [
  { name: "Boolean obj", code: "const a = new Boolean(true); const b = new Boolean(true); expect(deep(a, b)).toBe(true);" },
  { name: "Date", code: "const a = new Date(100); const b = new Date(100); expect(deep(a, b)).toBe(true);" },
  { name: "Set bipartite", code: "const a = new Set([{a:1},{a:2}]); const b = new Set([{a:2},{a:1}]); expect(deep(a, b)).toBe(true);" },
  { name: "Set diff", code: "const a = new Set([{a:1},{a:2}]); const b = new Set([{a:1},{a:3}]); expect(deep(a, b)).toBe(false);" },
  { name: "Uint8Array", code: "const a = new Uint8Array([1]); const b = new Uint8Array([1]); expect(deep(a, b)).toBe(true);" }
];

const results = {};
const agents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
for (const i of agents) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  try {
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  } catch (e) {
    console.log(`Agent ${i} patch failed to apply`);
    continue;
  }
  
  results[i] = {};
  for (const t of tests) {
    const testCode = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";
test("test", () => {
  const deep = (a, b) => {
    const schema = z.any().default(a, { skipEncoding: true });
    const result = z.object({ x: schema }).encode({ x: b });
    return !("x" in result);
  };
  ${t.code}
});
`;
    fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testCode);
    try {
      cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
      results[i][t.name] = "PASS";
    } catch (e) {
      results[i][t.name] = "FAIL";
    }
  }
}

console.log(JSON.stringify(results, null, 2));
