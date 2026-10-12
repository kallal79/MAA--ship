const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

// Tests for the calibrated 2-pass test suite
const specContent = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

// 1. encode skips default values in objects
test("encode skips default values in objects", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: true }),
    b: z.string().default("hello", { skipEncoding: true }),
  });
  expect(schema.encode({ a: 0, b: "hello" })).toEqual({});
  expect(schema.encode({ a: 1, b: "hello" })).toEqual({ a: 1 });
  expect(schema.encode({ a: 0, b: "world" })).toEqual({ b: "world" });
  expect(schema.encode({ a: 1, b: "world" })).toEqual({ a: 1, b: "world" });
});

// 2. encode skips default values in maps
test("encode skips default values in maps", () => {
  const schema = z.map(z.string(), z.number().default(0, { skipEncoding: true }));
  const m1 = new Map([["a", 0], ["b", 1]]);
  const result = schema.encode(m1);
  expect(result).toEqual(new Map([["b", 1]]));
});

// 3. encode skips default values in arrays
test("encode skips default values in arrays", () => {
  const schema = z.array(z.number().default(0, { skipEncoding: true }));
  expect(schema.encode([0, 1, 0, 2])).toEqual([1, 2]);
});

// 4. encode skips default values in tuples
test("encode skips default values in tuples", () => {
  const schema = z.tuple([
    z.number().default(0, { skipEncoding: true }),
    z.string(),
  ]);
  expect(schema.encode([0, "a"])).toEqual(["a"]);
  expect(schema.encode([1, "a"])).toEqual([1, "a"]);
});

// 5. encode skips multiple default values in tuples
test("encode skips multiple default values in tuples", () => {
  const schema = z.tuple([
    z.number().default(0, { skipEncoding: true }),
    z.string().default("x", { skipEncoding: true }),
    z.boolean().default(false, { skipEncoding: true }),
  ]);
  expect(schema.encode([0, "x", false])).toEqual([]);
  expect(schema.encode([1, "x", false])).toEqual([1]);
  expect(schema.encode([0, "y", false])).toEqual(["y"]);
});

// 6. encode skips default values in sets
test("encode skips default values in sets", () => {
  const schema = z.set(z.number().default(0, { skipEncoding: true }));
  const s = new Set([0, 1, 2]);
  const result = schema.encode(s);
  expect(result).toEqual(new Set([1, 2]));
});

// 7. predicate receives rawDefaultValue parameter (Requirement from Problem Description)
test("predicate receives rawDefaultValue parameter", () => {
  let passedRaw: any = null;
  const schema = z.object({
    a: z.string().default("fallback", {
      skipEncoding: (val, raw) => {
        passedRaw = raw;
        return val === "fallback";
      },
    }),
  });
  expect(schema.encode({ a: "fallback" })).toEqual({});
  expect(passedRaw).toBe("fallback");
});

// 8. async support with async predicate
test("async support", async () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v) => v === 0 }),
  });
  expect(await schema.encodeAsync({ a: 0 })).toEqual({});
  expect(await schema.encodeAsync({ a: 1 })).toEqual({ a: 1 });
});

// 9. sync encode with async predicate throws error
test("sync encode with async predicate throws error", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v) => v === 0 }),
  });
  expect(() => schema.encode({ a: 0 })).toThrowError(/Cannot use async skipEncoding in synchronous encode/);
});

// 10. nested defaults
test("nested defaults", () => {
  const inner = z.object({ x: z.number() }).default({ x: 0 }, { skipEncoding: true });
  const outer = z.object({ inner }).default({ inner: { x: 0 } }, { skipEncoding: true });
  const schema = z.object({ outer });
  expect(schema.encode({ outer: { inner: { x: 0 } } })).toEqual({});
  expect(schema.encode({ outer: { inner: { x: 1 } } })).toEqual({ outer: { inner: { x: 1 } } });
});

// 11. mini API exhaustive
test("mini API exhaustive", () => {
  const s1 = z.object({ n: z.number().default(0, { skipEncoding: true }) });
  expect(s1.encode({ n: 0 })).toEqual({});
  expect(s1.encode({ n: 1 })).toEqual({ n: 1 });

  const s2 = z.string().default("x", { skipEncoding: true });
  const obj2 = z.object({ v: s2 });
  expect(obj2.encode({ v: "x" })).toEqual({});
  expect(obj2.encode({ v: "y" })).toEqual({ v: "y" });

  const s3 = z.boolean().default(false, { skipEncoding: true });
  const obj3 = z.object({ flag: s3 });
  expect(obj3.encode({ flag: false })).toEqual({});
  expect(obj3.encode({ flag: true })).toEqual({ flag: true });
});

// 12. factory defaults with predicate
test("factory defaults", () => {
  const schema = z.object({
    arr: z.array(z.number()).default(() => [], { skipEncoding: (v) => v.length === 0 }),
  });
  expect(schema.encode({ arr: [] })).toEqual({});
  expect(schema.encode({ arr: [1] })).toEqual({ arr: [1] });
});

// 13. strict equality mode
test("strict equality mode", () => {
  const schema = z.object({
    n: z.number().default(0, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ n: 0 })).toEqual({});
  expect(schema.encode({ n: -0 })).toEqual({ n: -0 });
  expect(schema.encode({ n: 1 })).toEqual({ n: 1 });
});

// 14. shallow equality mode
test("shallow equality mode", () => {
  const obj = { x: 1 };
  const schema = z.object({
    o: z.object({ x: z.number() }).default(obj, { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ o: obj })).toEqual({});
  expect(schema.encode({ o: { x: 1 } })).toEqual({});
  expect(schema.encode({ o: { x: 2 } })).toEqual({ o: { x: 2 } });
});

// 15. wrapper transparency
test("wrapper transparency", () => {
  const schema = z.object({
    opt: z.number().default(0, { skipEncoding: true }).optional(),
    nul: z.number().default(0, { skipEncoding: true }).nullable(),
  });
  expect(schema.encode({ opt: 0, nul: 0 })).toEqual({});
  expect(schema.encode({ opt: 1, nul: 2 })).toEqual({ opt: 1, nul: 2 });
});

// 16. nullish wrapper transparency
test("nullish wrapper transparency", () => {
  const schema = z.object({
    a: z.string().default("def", { skipEncoding: true }).nullish(),
  });
  expect(schema.encode({ a: "def" })).toEqual({});
  expect(schema.encode({ a: "custom" })).toEqual({ a: "custom" });
  expect(schema.encode({ a: null })).toEqual({ a: null });
});

// 17. skipEncoding: false does not skip
test("skipEncoding: false does not skip", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: false }),
  });
  expect(schema.encode({ a: 0 })).toEqual({ a: 0 });
});

// 18. tuple middle element removal
test("tuple middle element removal", () => {
  const schema = z.tuple([
    z.string(),
    z.number().default(0, { skipEncoding: true }),
    z.boolean(),
  ]);
  expect(schema.encode(["a", 0, true])).toEqual(["a", true]);
  expect(schema.encode(["a", 1, true])).toEqual(["a", 1, true]);
});

// 19. deep equality ignores non-enumerable properties
test("deep equality ignores non-enumerable properties", () => {
  const defaultObj: any = { a: 1 };
  Object.defineProperty(defaultObj, "secret", {
    value: "hidden",
    enumerable: false,
    configurable: true,
  });

  const schema = z.object({
    obj: z.object({ a: z.number() }).default(defaultObj, { skipEncoding: true }),
  });

  expect(schema.encode({ obj: { a: 1 } })).toEqual({});
});

// 20. tuple multiple middle elements compacts correctly
test("tuple multiple middle elements compacts correctly", () => {
  const schema = z.tuple([
    z.number(),
    z.string().default("a", { skipEncoding: true }),
    z.string().default("b", { skipEncoding: true }),
    z.boolean(),
  ]);
  expect(schema.encode([10, "a", "b", true])).toEqual([10, true]);
});
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
const results = [];

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

for (const id of ['solution', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
  cleanRepo();

  if (id === 'solution') {
    execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/2_UPLOAD_THIS_AS_SOLUTION_PATCH/solution.patch', {
      cwd: ZOD_DIR,
      stdio: 'pipe'
    });
  } else {
    const p = path.join(AGENT_DIR, 'Nova_Nova_' + id, 'solution-patch.patch');
    if (!fs.existsSync(p)) {
      results.push({ agent: 'Nova #' + id, status: 'NO_PATCH', score: '0/20' });
      continue;
    }
    let txt = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const tmp = path.join(ZOD_DIR, '_tmp.patch');
    fs.writeFileSync(tmp, txt, 'utf8');
    try {
      execSync('git apply --whitespace=fix _tmp.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      results.push({ agent: 'Nova #' + id, status: 'PATCH_FAILED', score: '0/20' });
      continue;
    }
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }

  fs.writeFileSync(specPath, specContent, 'utf8');

  try {
    const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', {
      cwd: ZOD_DIR,
      stdio: 'pipe',
      timeout: 30000
    }).toString('utf8');

    results.push({ agent: id === 'solution' ? 'Solution' : 'Nova #' + id, status: 'SOLVED (PASS)', score: '20/20' });
  } catch (err) {
    const out = (err.stdout ? err.stdout.toString('utf8') : '') + (err.stderr ? err.stderr.toString('utf8') : '');
    const m = out.match(/Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed/);
    const passed = m ? m[2] : '0';
    results.push({ agent: id === 'solution' ? 'Solution' : 'Nova #' + id, status: 'MISSED REQUIREMENT (FAIL)', score: `${passed}/20` });
  }
}

cleanRepo();

console.log('\n======================================================');
console.log('       FINAL CALIBRATED 2-PASS NOVA EVALUATION        ');
console.log('======================================================');
console.table(results);

const passingAgents = results.filter(r => r.agent.startsWith('Nova') && r.status.includes('SOLVED'));
console.log(`\nTotal Solving Agents: ${passingAgents.length} / 13 (${((passingAgents.length/13)*100).toFixed(1)}% pass rate)`);
console.log(`Passing Agent List: ${passingAgents.map(a => a.agent).join(', ')}`);
console.log(`Reference Solution Status: ${results.find(r => r.agent === 'Solution')?.status} (${results.find(r => r.agent === 'Solution')?.score})`);
