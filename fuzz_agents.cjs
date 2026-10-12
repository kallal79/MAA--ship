const fs = require("fs");
const cp = require("child_process");

const tests = [
  { name: "NaN", code: "const a = NaN; const b = NaN; return deep(a, b) === true;" },
  { name: "+0 -0", code: "const a = +0; const b = -0; return deep(a, b) === false;" },
  { name: "Boolean obj", code: "const a = new Boolean(true); const b = new Boolean(true); return deep(a, b) === true;" },
  { name: "Number obj", code: "const a = new Number(1); const b = new Number(1); return deep(a, b) === true;" },
  { name: "String obj", code: "const a = new String('a'); const b = new String('a'); return deep(a, b) === true;" },
  { name: "Date", code: "const a = new Date(100); const b = new Date(100); return deep(a, b) === true;" },
  { name: "RegExp", code: "const a = /a/g; const b = /a/g; return deep(a, b) === true;" },
  { name: "Map keys", code: "const a = new Map(); a.set({}, 1); const b = new Map(); b.set({}, 1); return deep(a, b) === true;" },
  { name: "Set bipartite", code: "const a = new Set([{a:1},{a:2}]); const b = new Set([{a:1},{a:2}]); return deep(a, b) === true;" },
  { name: "Sparse array", code: "const a = []; a[1] = 1; const b = [undefined, 1]; return deep(a, b) === false;" },
  { name: "Array property", code: "const a = [1]; a.foo = 1; const b = [1]; return deep(a, b) === false;" },
  { name: "Non-enumerable", code: "const a = {}; Object.defineProperty(a, 'x', {value: 1}); const b = {}; return deep(a, b) === true;" },
  { name: "Symbol key", code: "const s = Symbol('s'); const a = {[s]: 1}; const b = {[s]: 1}; return deep(a, b) === true;" },
  { name: "Uint8Array", code: "const a = new Uint8Array([1]); const b = new Uint8Array([1]); return deep(a, b) === true;" },
  { name: "BigInt", code: "const a = 1n; const b = 1n; return deep(a, b) === true;" }
];

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  
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
