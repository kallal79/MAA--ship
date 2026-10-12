const fs = require("fs");
const cp = require("child_process");

const agents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const tests = [
  { name: "Object.is", code: "const a = {x: 1}; const b = a; expect(deep(a, b)).toBe(true);" },
  { name: "Array diff length", code: "const a = [1]; const b = [1, 2]; expect(deep(a, b)).toBe(false);" },
  { name: "Array sparse", code: "const a = [1,,3]; const b = [1,undefined,3]; expect(deep(a, b)).toBe(false);" },
  { name: "Map size", code: "const a = new Map(); const b = new Map([[1, 2]]); expect(deep(a, b)).toBe(false);" },
  { name: "Map deep keys", code: "const a = new Map([[{x:1}, 1]]); const b = new Map([[{x:1}, 1]]); expect(deep(a, b)).toBe(true);" },
  { name: "Object prototype", code: "const a = Object.create(null); a.x = 1; const b = {x: 1}; expect(deep(a, b)).toBe(false);" },
  { name: "Object extra keys", code: "const a = {x: 1, y: 2}; const b = {x: 1}; expect(deep(a, b)).toBe(false);" },
  { name: "Promise", code: "const a = Promise.resolve(); const b = Promise.resolve(); expect(deep(a, b)).toBe(false);" }
];

const results = {};
for (const i of agents) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  try {
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  } catch (e) {
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
