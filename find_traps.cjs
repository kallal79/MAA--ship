const fs = require("fs");
const { execSync } = require("child_process");

const TRAPS = `
import { expect, test } from "vitest";
import { z } from "../index.js";

test("TRAP1_CYCLE", () => {
  const a: any = {}; const b: any = {}; a.a = a; b.a = b;
  const schema = z.any().default(a, { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: b })).toEqual({});
});

test("TRAP2_NON_ENUM", () => {
  const a = {}; Object.defineProperty(a, "x", { value: 1, enumerable: false });
  const schema = z.any().default(a, { skipEncoding: true });
  const b = {}; Object.defineProperty(b, "x", { value: 1, enumerable: true });
  expect(z.object({ f: schema }).encode({ f: b })).toEqual({ f: b });
});

test("TRAP3_DATE", () => {
  const schema = z.any().default(new Date(1), { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: new Date(1) })).toEqual({});
});

test("TRAP4_URL", () => {
  const schema = z.any().default(new URL("http://a"), { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: new URL("http://a") })).toEqual({});
});

test("TRAP5_SPARSE_ARRAY", () => {
  const a = [1, , 2];
  const schema = z.any().default(a, { skipEncoding: true });
  const b = [1, undefined, 2];
  expect(z.object({ f: schema }).encode({ f: b })).toEqual({ f: b });
});

test("TRAP6_NAN_SET", () => {
  const schema = z.any().default(new Set([NaN]), { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: new Set([NaN]) })).toEqual({});
});

test("TRAP7_SET_DUPLICATES_DEEP", () => {
  const a = new Set([{x:1}, {x:1}]);
  const schema = z.any().default(a, { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: new Set([{x:1}, {x:1}]) })).toEqual({});
});

test("TRAP8_PROMISE", () => {
  const p = Promise.resolve();
  const schema = z.any().default(p, { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: p })).toEqual({});
});

test("TRAP9_ERROR", () => {
  const schema = z.any().default(new Error("a"), { skipEncoding: true });
  expect(z.object({ f: schema }).encode({ f: new Error("a") })).toEqual({});
});

test("TRAP10_STRICT_MODE_ZERO", () => {
  const schema = z.any().default(0, { skipEncoding: { mode: "strict" } });
  expect(z.object({ f: schema }).encode({ f: -0 })).toEqual({ f: -0 });
});

test("TRAP11_DEEP_MODE_ZERO", () => {
  const schema = z.any().default(0, { skipEncoding: { mode: "deep" } });
  expect(z.object({ f: schema }).encode({ f: -0 })).toEqual({ f: -0 });
});
`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/traps.spec.ts", TRAPS);

const results = {};

function safeGitReset() {
  for (let i = 0; i < 5; i++) {
    try {
      execSync("git reset --hard 1fb56a5c", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      execSync("git clean -fd", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
      return;
    } catch (e) {
      if (i === 4) throw e;
      execSync("node -e \"setTimeout(() => {}, 500)\"");
    }
  }
}

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  safeGitReset();
  
  try {
    execSync("git apply C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_" + i + "/solution-patch.patch", {stdio: "ignore", cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"});
  } catch (e) {
    console.log("Agent " + i + " patch failed");
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

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/trap_results.json", JSON.stringify(results, null, 2));
