const fs = require("fs");
const cp = require("child_process");

const agents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const tests = [
  { name: "fn_skip_sync", code: "const schema = z.any().default({a:1}, { skipEncoding: (encoded, raw) => encoded.a === 1 }); const result = z.object({ x: schema }).encode({ x: {a:1} }); expect(\"x\" in result).toBe(false);" },
  { name: "mode_shallow_plain", code: "const schema = z.any().default({a:{b:1}}, { skipEncoding: { mode: \"shallow\" } }); const result = z.object({ x: schema }).encode({ x: {a:{b:1}} }); expect(\"x\" in result).toBe(false);" },
  { name: "mode_shallow_differ", code: "const inner = {b:1}; const schema = z.any().default({a:inner}, { skipEncoding: { mode: \"shallow\" } }); const result = z.object({ x: schema }).encode({ x: {a:inner} }); expect(\"x\" in result).toBe(false);" },
  { name: "mode_strict_same_ref", code: "const ref = {a:1}; const schema = z.any().default(ref, { skipEncoding: { mode: \"strict\" } }); const result = z.object({ x: schema }).encode({ x: ref }); expect(\"x\" in result).toBe(false);" },
  { name: "mode_strict_diff_ref", code: "const schema = z.any().default({a:1}, { skipEncoding: { mode: \"strict\" } }); const result = z.object({ x: schema }).encode({ x: {a:1} }); expect(\"x\" in result).toBe(true);" }
];

const results = {};
for (const i of agents) {
  try {
    cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
    
    results[i] = {};
    for (const t of tests) {
      const testCode = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";
test("test", () => {
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
  } catch (e) {
    results[i] = { error: e.message };
  }
}

console.log(JSON.stringify(results, null, 2));
