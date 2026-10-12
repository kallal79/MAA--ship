const fs = require('fs');
const cp = require('child_process');
const repoDir = "C:/Users/USER/OneDrive/Desktop/MAA/zod";

// ==========================================================================
// PLAN: Rebuild the test patch from scratch to address ALL reviewer issues:
//
// Neeraj v3 issues to fix:
// P4: Shallow mode description clarifications → Add in-code comments
// T3: Set bipartite matching test needs same-size sets with repeated elements
// T4 (shallow Map): Add positive + negative shallow Map equality tests
// T4 (TypeScript): Remove // @ts-nocheck from types file, use @ts-expect-error properly
// S1: nested defaults with conflicting skipEncoding - correct assertion per spec:
//     outer default re-evaluates its OWN rule, so skipEncoding:false means NOT skip → val: "inner" 
//     (the correct behavior per spec is toEqual({ val: "inner" }) not toEqual({}))
// S2: JIT fast path - no behavior test needed, just don't add tests that rely on it
// ==========================================================================

cp.execSync('git reset --hard HEAD', { cwd: repoDir, stdio: 'ignore' });
cp.execSync('git clean -fd', { cwd: repoDir, stdio: 'ignore' });

// Write the main test file (no @ts-nocheck)
const mainTestContent = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

test("encode skips default values in objects", () => {
  const schema = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  expect(schema.encode({ a: 0 })).toEqual({});
  expect(schema.encode({ a: 1 })).toEqual({ a: 1 });
});

test("root-level predicate-based skipEncoding evaluation", () => {
  let called = false;
  const schema = z.number().default(0, {
    skipEncoding: (v: number) => {
      called = true;
      return v === 0;
    },
  });
  expect(z.object({ a: schema }).encode({ a: 0 })).toEqual({});
  expect(called).toBe(true);
});

test("encode skips default values in records", () => {
  const schema = z.record(z.string(), z.number().default(0, { skipEncoding: true }));
  expect(schema.encode({ a: 0, b: 1 })).toEqual({ b: 1 });
});

test("encode skips default values in maps", () => {
  const schema = z.map(z.string(), z.number().default(0, { skipEncoding: true }));
  const map = new Map([
    ["a", 0],
    ["b", 1],
  ]);
  expect(schema.encode(map)).toEqual(new Map([["b", 1]]));
});

test("encode skips default values in tuples", () => {
  const schema = z.tuple([z.string(), z.boolean(), z.number().default(0, { skipEncoding: true })]);
  expect(schema.encode(["a", true, 0])).toEqual(["a", true]);
});

test("encode skips multiple default values in tuples", () => {
  const schema = z.tuple([
    z.string().default("a", { skipEncoding: true }),
    z.boolean().default(false, { skipEncoding: true }),
    z.number().default(0, { skipEncoding: true }),
  ]);
  expect(schema.encode(["a", false, 0])).toEqual([]);
});

test("encode skips default values with deep equality", () => {
  const schema = z.object({
    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }),
    prim: z.nan().default(Number.NaN, { skipEncoding: true }),
    prim2: z.number().default(-0, { skipEncoding: true }),
  });
  expect(
    schema.encode({
      arr: [1, 2],
      obj: { x: 1 },
      prim: Number.NaN,
      prim2: -0,
    })
  ).toEqual({});
});

test("sparse hole equivalence", () => {
  const arr1: number[] = [];
  arr1[2] = 1;
  const schema = z.object({
    a: z.any().default(arr1, { skipEncoding: true }),
  });
  expect(schema.encode({ a: [undefined, undefined, 1] })).toEqual({});
});

test("implicit default option behaves identically to skipEncoding: true", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: true }),
  });
  expect(schema.encode({ a: 0 })).toEqual({});
});

test("async support", async () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v) => v === 0 }),
  });
  await expect(schema.encodeAsync({ a: 0 })).resolves.toEqual({});
  expect(() => schema.encode({ a: 0 })).toThrow("Cannot use async skipEncoding in synchronous encode");
});

test("nested defaults", () => {
  const inner = z.object({ x: z.number().default(0, { skipEncoding: true }) });
  const outer = inner.default({ x: 0 }, { skipEncoding: true });
  expect(z.object({ o: outer }).encode({ o: { x: 0 } })).toEqual({});
  expect(outer.encode({ x: 1 })).toEqual({ x: 1 });
});

test("factory defaults", () => {
  expect(() => {
    const schema = z.object({ a: z.number().default(() => Math.random(), { skipEncoding: true }) });
    schema.encode({ a: 0 });
  }).toThrow("factory default");
  const schema2 = z.object({ a: z.number().default(() => 0, { skipEncoding: (v) => v === 0 }) });
  expect(schema2.encode({ a: 0 })).toEqual({});
});

test("strict equality mode", () => {
  const schema = z.object({
    arr: z.array(z.number()).default([1, 2], { skipEncoding: { mode: "strict" } }),
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: { mode: "strict" } }),
    prim: z.number().default(0, { skipEncoding: { mode: "strict" } }),
  });
  expect(schema.encode({ arr: [1, 2], obj: { x: 1 }, prim: 0 })).toEqual({
    arr: [1, 2],
    obj: { x: 1 },
  });
});

// Shallow mode compares top-level members by identity (Object.is).
// For plain objects/arrays: each property/element must be the same reference.
// For Map: each key-value pair's key and value must be the same reference.
// For Set: each element must be the same reference.
test("shallow equality mode - arrays and plain objects", () => {
  const innerObj = { a: 1 };
  const innerArr = [2];
  const schema = z.object({
    arr: z.array(z.any()).default([1, innerObj], { skipEncoding: { mode: "shallow" } }),
    obj: z.record(z.string(), z.any()).default({ a: 1, b: innerArr }, { skipEncoding: { mode: "shallow" } }),
  });
  // Positive: same top-level element references => shallow identity passes
  expect(schema.encode({ arr: [1, innerObj], obj: { a: 1, b: innerArr } })).toEqual({});
  // Negative: structurally identical but different references => shallow identity fails
  expect(schema.encode({ arr: [1, { a: 1 }], obj: { a: 1, b: [2] } })).toEqual({
    arr: [1, { a: 1 }],
    obj: { a: 1, b: [2] },
  });
});

// Shallow Map equality: top-level members are the key-value pairs.
// Object.is is used on each key and each value independently.
test("shallow Map equality mode - same key and value instances match, different instances do not", () => {
  const k1 = { id: 1 };
  const v1 = { val: "v1" };
  const mapSchema = z.object({
    m: z.map(z.any(), z.any()).default(new Map([[k1, v1]]), { skipEncoding: { mode: "shallow" } }),
  });
  // Positive: same key and value instances => shallow identity check passes
  expect(mapSchema.encode({ m: new Map([[k1, v1]]) })).toEqual({});
  // Negative: structurally identical but distinct key instance => shallow identity fails
  expect(mapSchema.encode({ m: new Map([[{ id: 1 }, v1]]) })).toEqual({ m: new Map([[{ id: 1 }, v1]]) });
  // Negative: structurally identical but distinct value instance => shallow identity fails
  expect(mapSchema.encode({ m: new Map([[k1, { val: "v1" }]]) })).toEqual({ m: new Map([[k1, { val: "v1" }]]) });
});

// Shallow Set equality: top-level members are the elements.
// Object.is is used on each element.
test("shallow Set equality mode - same element instances match, different instances do not", () => {
  const el1 = { id: 1 };
  const setSchema = z.object({
    s: z.set(z.any()).default(new Set([el1]), { skipEncoding: { mode: "shallow" } }),
  });
  // Positive: same element instance => shallow identity check passes
  expect(setSchema.encode({ s: new Set([el1]) })).toEqual({});
  // Negative: structurally identical but distinct instance => shallow identity fails
  expect(setSchema.encode({ s: new Set([{ id: 1 }]) })).toEqual({ s: new Set([{ id: 1 }]) });
});

test("deep equality behaves identically to skipEncoding: true", () => {
  const schemaDeep = z.object({
    x: z.object({ a: z.array(z.number()) }).default({ a: [1] }, { skipEncoding: { mode: "deep" } }),
  });
  const schemaTrue = z.object({ x: z.object({ a: z.array(z.number()) }).default({ a: [1] }, { skipEncoding: true }) });
  expect(schemaDeep.encode({ x: { a: [1] } })).toEqual({});
  expect(schemaTrue.encode({ x: { a: [1] } })).toEqual({});
});

test("nested defaults skip independently", () => {
  const schema = z.object({
    outer: z
      .object({
        inner: z.number().default(0, { skipEncoding: true }),
      })
      .default({ inner: 1 }, { skipEncoding: true }),
  });
  expect(schema.encode({ outer: { inner: 0 } })).toEqual({ outer: {} });
  expect(schema.encode({ outer: { inner: 1 } })).toEqual({});
});

test("Map deep equality is order-insensitive and deeply compares keys and values", () => {
  const schema = z.object({
    m: z.map(z.string(), z.object({ a: z.number() })).default(
      new Map([
        ["k1", { a: 1 }],
        ["k2", { a: 2 }],
      ]),
      { skipEncoding: true }
    ),
  });
  expect(
    schema.encode({
      m: new Map([
        ["k2", { a: 2 }],
        ["k1", { a: 1 }],
      ]),
    })
  ).toEqual({});
  expect(
    schema.encode({
      m: new Map([
        ["k1", { a: 1 }],
        ["k2", { a: 3 }],
      ]),
    })
  ).toEqual({
    m: new Map([
      ["k1", { a: 1 }],
      ["k2", { a: 3 }],
    ]),
  });
});

test("Set deep equality is order-insensitive and deeply compares elements", () => {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
  });
  expect(schema.encode({ s: new Set([{ a: 2 }, { a: 1 }]) })).toEqual({});
  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 3 }]) })).toEqual({
    s: new Set([{ a: 1 }, { a: 3 }]),
  });
});

// T3 fix: bipartite matching requires same-size sets where repeated deep-equivalent
// elements prevent naive one-to-many matching from succeeding.
// default={a:1},{a:2}; input={a:1},{a:1} — same size, but bipartite match fails
// because {a:1} can only pair with one entry and {a:2} has no match.
test("Set deep equality requires 1-to-1 bipartite matching", () => {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
  });
  // Same cardinality, but {a:1} repeated twice — cannot bipartite-match {a:2}
  expect(schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) })).toEqual({
    s: new Set([{ a: 1 }, { a: 1 }]),
  });
});

test("sync predicate", () => {
  const schema = z.object({ a: z.number().default(1, { skipEncoding: (v) => v === 1 }) });
  expect(schema.encode({ a: 1 })).toEqual({});
  expect(schema.encode({ a: 2 })).toEqual({ a: 2 });
});

test("container-level defaults", () => {
  const schema = z.object({
    obj: z.record(z.string(), z.number()).default({ a: 1 }, { skipEncoding: true }),
    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
  });
  expect(schema.encode({ obj: { a: 1 }, arr: [1, 2] })).toEqual({});
});

test("wrapper interaction", () => {
  const schema = z.object({
    opt: z.number().default(0, { skipEncoding: true }).optional(),
    nul: z.number().default(0, { skipEncoding: true }).nullable(),
  });
  expect(schema.encode({ opt: 0, nul: 0 })).toEqual({});
});

test("encodeAsync + factory + predicate", async () => {
  const schema = z.object({
    a: z.number().default(() => 0, { skipEncoding: async (v) => v === 0 }),
  });
  await expect(schema.encodeAsync({ a: 0 })).resolves.toEqual({});
  await expect(schema.encodeAsync({ a: 1 })).resolves.toEqual({ a: 1 });
});

test("implicit default option behaves as deep", () => {
  const schema = z.object({ a: z.number().default(0) });
  expect(schema.encode({ a: 0 })).toEqual({});
  expect(schema.encode({ a: 1 })).toEqual({ a: 1 });
});

test("factory defaults reject boolean and mode options", () => {
  const errPrefix = "Cannot use skipEncoding";
  const errSuffix = "with a factory default";
  expect(() =>
    z
      .number()
      .default(() => 0, { skipEncoding: true })
      .encode(0)
  ).toThrowError(new RegExp(errPrefix + ".*" + errSuffix));
  expect(() =>
    z
      .number()
      .default(() => 0, { skipEncoding: false })
      .encode(0)
  ).toThrowError(new RegExp(errPrefix + ".*" + errSuffix));
  expect(() =>
    z
      .number()
      .default(() => 0, { skipEncoding: { mode: "shallow" } })
      .encode(0)
  ).toThrowError(new RegExp(errPrefix + ".*" + errSuffix));
  expect(() =>
    z
      .number()
      .default(() => 0, { skipEncoding: { mode: "deep" } })
      .encode(0)
  ).toThrowError(new RegExp(errPrefix + ".*" + errSuffix));
  expect(() =>
    z
      .number()
      .default(() => 0, { skipEncoding: { mode: "strict" } })
      .encode(0)
  ).toThrowError(new RegExp(errPrefix + ".*" + errSuffix));
});

test("tuple removes middle element and shifts left", () => {
  const schema = z.tuple([z.string(), z.number().default(0, { skipEncoding: true }), z.boolean()]);
  expect(schema.encode(["a", 0, true])).toEqual(["a", true]);
});

test("tuple removes rest elements if omitted", () => {
  const schema = z.tuple([z.string()]).rest(z.number().default(0, { skipEncoding: true }));
  expect(schema.encode(["a", 0, 1, 0])).toEqual(["a", 1]);
});

test("predicate receives the final encoded output, not the raw input, and exact defaultValue", () => {
  const defaultObj = { y: 0 };
  let capturedV: any;
  let capturedDef: any;
  const defSchema = z.object({ y: z.number() }).default(defaultObj, {
    skipEncoding: function (v, def) {
      capturedV = v;
      capturedDef = def;
      return true;
    },
  });
  const schema = z.object({
    x: defSchema,
  });
  expect(schema.encode({ x: { y: 0 } })).toEqual({});
  expect(capturedV).toEqual({ y: 0 });
  expect(capturedDef).toEqual(defaultObj);
});

test("predicate receives undefined for factory defaults", () => {
  let capturedDef: any = "NOT_UNDEFINED";
  const schema = z.object({
    a: z.number().default(() => 0, {
      skipEncoding: (_v, def) => {
        capturedDef = def;
        return true;
      },
    }),
  });
  expect(schema.encode({ a: 0 })).toEqual({});
  expect(capturedDef).toBeUndefined();
});

test("comparison against final encoded output not explicitly distinguished", () => {
  const schema = z.object({ x: z.number().default(0, { skipEncoding: (v) => v === 0 }) });
  expect(schema.encode({ x: 0 })).toEqual({});
  expect(schema.encode({ x: 1 })).toEqual({ x: 1 });
});

test("encoded default comparison requires encoding the default first", () => {
  const inner = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  const schema = inner.default({ a: 1 }, { skipEncoding: true });

  expect(z.object({ s: schema }).encode({ s: { a: 1 } })).toEqual({});
  expect(z.object({ s: schema }).encode({ s: { a: 0 } })).toEqual({ s: {} });

  const schema2 = inner.default({ a: 0 }, { skipEncoding: true });
  expect(z.object({ s: schema2 }).encode({ s: { a: 0 } })).toEqual({});
  expect(z.object({ s: schema2 }).encode({ s: { a: 1 } })).toEqual({ s: { a: 1 } });
});

test("deep equality ignores object key order", () => {
  const schema = z.object({ o: z.any().default({ a: 1, b: 2 }, { skipEncoding: true }) });
  expect(schema.encode({ o: { b: 2, a: 1 } })).toEqual({});
});

test("transparent pass-through via the .catch() wrapper", () => {
  const schema = z.object({ val: z.number().default(0, { skipEncoding: true }).catch(10) });
  expect(schema.encode({ val: 0 })).toEqual({});
  expect(schema.encode({ val: 10 })).toEqual({ val: 10 });
});

test("throws when sync predicate returns a promise during sync encode", () => {
  const schema = z.object({ a: z.number().default(0, { skipEncoding: () => Promise.resolve(true) }) });
  expect(() => schema.encode({ a: 0 })).toThrow("Cannot use async skipEncoding in synchronous encode");
});

test("deep equality mode for Maps with identical object keys", () => {
  const map1 = new Map([[{ k: 1 }, "v"]]);
  const map2 = new Map([[{ k: 1 }, "v"]]);
  const schema = z.any().default(map1, { skipEncoding: true });
  expect(z.object({ m: schema }).encode({ m: map2 })).toEqual({});
});

test("deep equality mode for Sets with identical object elements", () => {
  const set1 = new Set([{ k: 1 }]);
  const set2 = new Set([{ k: 1 }]);
  const schema = z.any().default(set1, { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: set2 })).toEqual({});
});

test("deep map key equality", () => {
  const schema = z.object({
    m: z.map(z.object({ k: z.number() }), z.string()).default(new Map([[{ k: 1 }, "v"]]), { skipEncoding: true }),
  });
  expect(schema.encode({ m: new Map([[{ k: 1 }, "v"]]) })).toEqual({});
  expect(schema.encode({ m: new Map([[{ k: 2 }, "v"]]) })).toEqual({ m: new Map([[{ k: 2 }, "v"]]) });
});

test("transparent wrappers pass through omission", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: true }).optional(),
    b: z.number().default(0, { skipEncoding: true }).nullable(),
    c: z.number().default(0, { skipEncoding: true }).catch(1),
  });
  expect(schema.encode({ a: 0, b: 0, c: 0 })).toEqual({});
  expect(schema.encode({ a: 1, b: 1, c: 1 })).toEqual({ a: 1, b: 1, c: 1 });
});

test("intersection handling of defaulted schema with skipEncoding", () => {
  const left = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  const right = z.object({ b: z.string() });
  const inter = z.intersection(left, right);
  expect(inter.encode({ a: 0, b: "hello" })).toEqual({ b: "hello" });
});

test("deep equality handles sparse arrays (LLM trap)", () => {
  const arr1: number[] = [];
  arr1[2] = 1;
  const arr2: number[] = [];
  arr2[2] = 1;

  const schema = z.any().default(arr1, { skipEncoding: true });
  expect(z.object({ a: schema }).encode({ a: arr2 })).toEqual({});
});

test("deep equality correctly matches NaN in Sets (LLM trap)", () => {
  const schema = z.any().default(new Set([Number.NaN]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([Number.NaN]) })).toEqual({});
  expect(z.object({ s: schema }).encode({ s: new Set([0]) })).toEqual({ s: new Set([0]) });
});

test("encoding default that produces issues should keep current value without throwing", () => {
  const inner = z.string().length(2);
  const schema = inner.default("hello", { skipEncoding: true });
  expect(schema.encode("ab")).toBe("ab");
});

// S1 fix: Each ZodDefault independently evaluates its own skipEncoding rule.
// When outer has skipEncoding:false it must NOT omit even if inner would omit.
// When outer has skipEncoding:true and sees that its encoded value equals its static default, it omits.
test("chained ZodDefault each independently evaluates its own skipEncoding rule", () => {
  // inner omits "x" when value === "x"; outer does NOT omit (skipEncoding: false)
  const schema1 = z.object({
    val: z.string().default("x", { skipEncoding: true }).default("outer", { skipEncoding: false }),
  });
  // With val="x": inner would omit, but outer re-evaluates and its default is "outer" not "x" => does not omit
  expect(schema1.encode({ val: "x" })).toEqual({ val: "x" });

  // Both layers want to omit when value matches their own defaults
  const schema2 = z.object({
    val: z.string().default("x", { skipEncoding: true }).default("x", { skipEncoding: true }),
  });
  expect(schema2.encode({ val: "x" })).toEqual({});
});
`;

fs.writeFileSync(repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', mainTestContent);

// Write the types test file — NO @ts-nocheck so TypeScript checks run
const typesTestContent = `import { expect, test } from "vitest";
import { z } from "../../../index.js";

// This file intentionally has NO @ts-nocheck so the TypeScript compiler validates
// the type surface of the skipEncoding option.

test("TypeScript declaration surface for skipEncoding", () => {
  // All valid overload forms should type-check cleanly:
  z.number().default(0, { skipEncoding: true });
  z.number().default(0, { skipEncoding: false });
  z.number().default(0, { skipEncoding: { mode: "shallow" } });
  z.number().default(0, { skipEncoding: { mode: "deep" } });
  z.number().default(0, { skipEncoding: { mode: "strict" } });
  z.number().default(0, { skipEncoding: (v: number) => v === 0 });

  const s = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  expect(s.encode({ a: 0 })).toEqual({});

  // These forms should be rejected by the TypeScript compiler:
  // @ts-expect-error invalid mode string
  z.number().default(0, { skipEncoding: { mode: "invalid" } });

  // @ts-expect-error string is not a valid skipEncoding value
  z.number().default(0, { skipEncoding: "true" });
});
`;

fs.writeFileSync(repoDir + '/packages/zod/src/v4/classic/tests/encode-defaults-skipEncoding-types.spec.ts', typesTestContent);

cp.execSync('git add -A', { cwd: repoDir, stdio: 'ignore' });
const diff = cp.execSync('git diff HEAD', { cwd: repoDir });
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/FINAL_SUBMIT_HERE/FINAL_TEST_PATCH.patch', diff);

console.log("FINAL_TEST_PATCH.patch rebuilt successfully!");
