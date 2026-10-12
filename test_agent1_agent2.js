const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ZOD_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/zod';
const AGENT_DIR = 'C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW';

function cleanRepo() {
  try {
    execSync('git reset --hard HEAD', { cwd: ZOD_DIR, stdio: 'pipe' });
    execSync('git clean -fd', { cwd: ZOD_DIR, stdio: 'pipe' });
  } catch (e) {}
}

const testContent = `import { expect, test } from "vitest";
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

// 2. encode skips default values in maps (value side)
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

// 7. predicate receives rawDefaultValue parameter
test("predicate receives rawDefaultValue parameter", () => {
  let passedRaw: any = null;
  const schema = z.object({
    a: z.string().default("fallback", {
      skipEncoding: (val: any, raw?: any) => {
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
    a: z.number().default(0, { skipEncoding: async (v: any) => v === 0 }),
  });
  expect(await schema.encodeAsync({ a: 0 })).toEqual({});
  expect(await schema.encodeAsync({ a: 1 })).toEqual({ a: 1 });
});

// 9. sync encode with async predicate throws error
test("sync encode with async predicate throws error", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v: any) => v === 0 }),
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
    arr: z.array(z.number()).default(() => [], { skipEncoding: (v: any) => v.length === 0 }),
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

// 21. Reviewer T3: Set deep equality requires 1-to-1 bipartite matching with equal cardinality
test("Set deep equality requires 1-to-1 bipartite matching with equal cardinality", () => {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(
      new Set([{ a: 1 }, { a: 2 }]),
      { skipEncoding: true }
    ),
  });
  // Positive case: matching elements
  expect(schema.encode({ s: new Set([{ a: 2 }, { a: 1 }]) })).toEqual({});
  // Negative case: equal size (2) but both match { a: 1 } - cannot match { a: 2 }
  const nonMatching = new Set([{ a: 1 }, { a: 1 }]);
  expect(schema.encode({ s: nonMatching })).toEqual({ s: nonMatching });
});

// 22. Reviewer T4: shallow equality mode - Map key and value identity
test("shallow equality mode - Map key and value identity", () => {
  const v1 = { val: "a" };
  const schema = z.object({
    m: z.map(z.string(), z.any()).default(
      new Map([["k1", v1]]),
      { skipEncoding: { mode: "shallow" } }
    ),
  });
  // Positive case: exact same key and value references
  expect(schema.encode({ m: new Map([["k1", v1]]) })).toEqual({});
  // Negative case: distinct instance
  expect(schema.encode({ m: new Map([["k1", { val: "a" }]]) })).toEqual({
    m: new Map([["k1", { val: "a" }]]),
  });
});

// 23. encodeAsync with factory default and async predicate
test("encodeAsync with factory default and async predicate", async () => {
  const schema = z.object({
    arr: z.array(z.number()).default(() => [], {
      skipEncoding: async (v: any) => v.length === 0,
    }),
  });
  expect(await schema.encodeAsync({ arr: [] })).toEqual({});
  expect(await schema.encodeAsync({ arr: [1] })).toEqual({ arr: [1] });
});

// 24. Map key-side default schema triggers entry omission
test("Map key-side default schema triggers entry omission", () => {
  const schema = z.map(
    z.string().default("omitted_key", { skipEncoding: true }),
    z.number()
  );
  const m = new Map([
    ["omitted_key", 10],
    ["valid_key", 20],
  ]);
  expect(schema.encode(m)).toEqual(new Map([["valid_key", 20]]));
});

// 25. Records omission with skipEncoding
test("Records omission with skipEncoding", () => {
  const schema = z.record(
    z.string(),
    z.number().default(0, { skipEncoding: true })
  );
  expect(schema.encode({ a: 0, b: 1, c: 0, d: 2 })).toEqual({ b: 1, d: 2 });
});

// 26. Factory default rejects boolean option with exact error
test("factory default rejects boolean option with exact error", () => {
  expect(() => {
    const s = z.string().default(() => "x", { skipEncoding: true });
    s.encode("x");
  }).toThrowError(/Cannot use skipEncoding: true with a factory default/);
});
`;

const specPath = path.join(ZOD_DIR, 'packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts');
fs.writeFileSync(specPath, testContent, 'utf8');

// Test Reference Solution
cleanRepo();
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/solution.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
fs.writeFileSync(specPath, testContent, 'utf8');
try {
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: ZOD_DIR }).toString();
  console.log('=== Reference Solution: ALL PASSED ===');
} catch (e) {
  console.log('=== Reference Solution: FAILED ===', e.stdout ? e.stdout.toString() : '');
}

// Test Agent 1
cleanRepo();
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_1/solution-patch.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
fs.writeFileSync(specPath, testContent, 'utf8');
try {
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: ZOD_DIR }).toString();
  console.log('=== Agent 1: ALL PASSED ===');
} catch (e) {
  console.log('=== Agent 1: FAILED ===', e.stdout ? e.stdout.toString() : '');
}

// Test Agent 2
cleanRepo();
execSync('git apply --whitespace=fix C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-LAST-FINAL-NEW/Nova_Nova_2/solution-patch.patch', { cwd: ZOD_DIR, stdio: 'pipe' });
fs.writeFileSync(specPath, testContent, 'utf8');
try {
  const out = execSync('npx vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --no-typecheck', { cwd: ZOD_DIR }).toString();
  console.log('=== Agent 2: ALL PASSED ===');
} catch (e) {
  console.log('=== Agent 2: FAILED ===', e.stdout ? e.stdout.toString() : '');
}
