import { describe, expect, test } from "vitest";
import { z } from "../../../index.js";
import * as util from "../../core/util.js";
import * as zmini from "../../mini/index.js";

test("encode skips default values in objects", () => {
  const schema = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  expect(schema.encode({ a: 0 })).toEqual({});
  expect(schema.encode({ a: 1 })).toEqual({ a: 1 });
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

test("encode skips default values in arrays", () => {
  const schema = z.array(z.number().default(0, { skipEncoding: true }));
  expect(schema.encode([1, 0, 2])).toEqual([1, 2]);
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

test("encode skips default values in sets", () => {
  const schema = z.set(z.number().default(0, { skipEncoding: true }));
  const set = new Set([1, 0, 2]);
  expect(schema.encode(set)).toEqual(new Set([1, 2]));
});

test("encode skips default values with deep equality", () => {
  const schema = z.object({
    date: z.date().default(new Date(1000), { skipEncoding: true }),
    arr: z.array(z.number()).default([1, 2], { skipEncoding: true }),
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }),
    prim: z.nan().default(Number.NaN, { skipEncoding: true }),
    prim2: z.number().default(-0, { skipEncoding: true }),
  });
  expect(
    schema.encode({
      date: new Date(1000),
      arr: [1, 2],
      obj: { x: 1 },
      prim: Number.NaN,
      prim2: -0,
    })
  ).toEqual({});
});

test("async support", async () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: async (v) => v === 0 }),
  });
  await expect(schema.encodeAsync({ a: 0 })).resolves.toEqual({});
  expect(() => schema.encode({ a: 0 })).toThrow(/Cannot use async skipEncoding/);
});

test("nested defaults", () => {
  const inner = z.object({ x: z.number().default(0, { skipEncoding: true }) });
  const outer = inner.default({ x: 0 }, { skipEncoding: true });
  expect(outer.encode({ x: 0 })).toEqual({});
  expect(outer.encode({ x: 1 })).toEqual({ x: 1 });
});

test("mini API exhaustive", async () => {
  const schema = zmini.object({
    a: zmini._default(zmini.number(), 0, { skipEncoding: true }),
    b: zmini._default(zmini.number(), () => 0, { skipEncoding: (v) => v === 0 }),
    c: zmini._default(zmini.number(), 0, { skipEncoding: { mode: "strict" } }),
  });

  expect(z.encode(schema, { a: 0, b: 0, c: 0 })).toEqual({});
  expect(z.encode(schema, { a: 1, b: 1, c: 1 })).toEqual({ a: 1, b: 1, c: 1 });

  const asyncSchema = zmini.object({
    a: zmini._default(zmini.number(), 0, { skipEncoding: async (v) => v === 0 }),
  });
  await expect(z.encodeAsync(asyncSchema, { a: 0 })).resolves.toEqual({});
});

test("factory defaults", () => {
  expect(() => {
    const schema = z.object({ a: z.number().default(() => Math.random(), { skipEncoding: true }) });
    schema.encode({ a: 0 });
  }).toThrow("Cannot use skipEncoding: true with a factory default");
  const schema2 = z.object({ a: z.number().default(() => 0, { skipEncoding: (v) => v === 0 }) });
  expect(schema2.encode({ a: 0 })).toEqual({});
});

test("strict equality mode distinguishes signed zeroes and NaNs", () => {
  const schema = z.object({
    zero: z.number().default(-0, { skipEncoding: { mode: "strict" } }),
    nan: z.number().default(NaN, { skipEncoding: { mode: "strict" } }),
  });

  // Object.is(-0, +0) is false
  expect(schema.encode({ zero: 0, nan: NaN })).toEqual({ zero: 0 });
  expect(schema.encode({ zero: -0, nan: NaN })).toEqual({});
});

test("shallow equality mode - Map and Set", () => {
  const objRef = { k: 1 };
  const keyRef = { key: 1 };
  const schemaMap = z.object({
    m: z.map(z.any(), z.any()).default(new Map([[keyRef, objRef]]), { skipEncoding: { mode: "shallow" } }),
  });
  // Match key and value identity
  expect(schemaMap.encode({ m: new Map([[keyRef, objRef]]) })).toEqual({});
  // Structurally identical but distinct instances must NOT match in shallow mode
  expect(schemaMap.encode({ m: new Map([[{ key: 1 }, { k: 1 }]]) })).toEqual({ m: new Map([[{ key: 1 }, { k: 1 }]]) });

  const schemaSet = z.object({
    s: z.set(z.any()).default(new Set([objRef]), { skipEncoding: { mode: "shallow" } }),
  });
  expect(schemaSet.encode({ s: new Set([objRef]) })).toEqual({});
  expect(schemaSet.encode({ s: new Set([{ k: 1 }]) })).toEqual({ s: new Set([{ k: 1 }]) });
});

test("deep Date equality handles timestamp mismatches", () => {
  const schema = z.object({
    d: z.date().default(new Date(1000), { skipEncoding: { mode: "deep" } }),
  });
  expect(schema.encode({ d: new Date(1000) })).toEqual({});
  expect(schema.encode({ d: new Date(2000) })).toEqual({ d: new Date(2000) });
});

test("deep Map and Set 1-to-1 bipartite matching and size check", () => {
  const schemaMap = z.object({
    m: z.map(z.object({ k: z.number() }), z.number()).default(
      new Map([
        [{ k: 1 }, 10],
        [{ k: 2 }, 20],
      ]),
      { skipEncoding: true }
    ),
  });
  // Counterpart reuse / cardinality mismatch must fail
  expect(
    schemaMap.encode({
      m: new Map([
        [{ k: 1 }, 10],
        [{ k: 1 }, 10],
      ]),
    })
  ).toEqual({
    m: new Map([
      [{ k: 1 }, 10],
      [{ k: 1 }, 10],
    ]),
  });

  const schemaSet = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
  });
  // Positive case
  expect(schemaSet.encode({ s: new Set([{ a: 2 }, { a: 1 }]) })).toEqual({});
  // Negative case (equal cardinality, but duplicate equivalence class, must NOT be omitted)
  // Set([{ a: 1 }, { a: 1 }]) becomes a Set of size 2 structurally, but with identical deep values
  const inputSet = new Set([{ a: 1 }]);
  inputSet.add({ a: 1 }); // Adds second distinct object reference, making set size 2
  expect(schemaSet.encode({ s: inputSet })).toEqual({ s: inputSet });
});

test("async predicate omission in collection async paths", async () => {
  const schemaArr = z.array(z.number().default(0, { skipEncoding: async (v) => v === 0 }));
  await expect(schemaArr.encodeAsync([0, 1, 0])).resolves.toEqual([1]);
});

test("defaulted record and map keys omit entry when matching", () => {
  const schemaRecord = z.record(z.string().default("key", { skipEncoding: true }), z.number());
  expect(schemaRecord.encode({ key: 1, other: 2 })).toEqual({ other: 2 });

  const schemaMap = z.map(z.string().default("key", { skipEncoding: true }), z.number());
  expect(schemaMap.encode(new Map([["key", 1], ["other", 2]]))).toEqual(new Map([["other", 2]]));
});

test("pipe wrappers preserve inner omission markers", () => {
  const inner = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  const piped = z.pipe(inner, z.object({ a: z.number().optional() }));
  expect(piped.encode({ a: 0 })).toEqual({});
});

test("deep equality does not conflate arrays and plain objects", () => {
  const schema = z.object({
    x: z.any().default([], { skipEncoding: true }),
  });
  expect(schema.encode({ x: {} })).toEqual({ x: {} });
});

test("skipEncoding: false explicitly does not omit", () => {
  const schema = z.object({ a: z.number().default(0, { skipEncoding: false }) });
  expect(schema.encode({ a: 0 })).toEqual({ a: 0 });
});

test("root-level encode is never omitted", () => {
  const schema = z.number().default(0, { skipEncoding: true });
  expect(schema.encode(0)).toBe(0);
});

test("pipe wrappers preserve inner default omission", () => {
  const schema = z.object({
    value: z.number().optional().pipe(z.number().default(0, { skipEncoding: true })),
  });
  expect(schema.encode({ value: 0 })).toEqual({});
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

test("TypeScript option signatures", () => {
  // Valid signatures
  z.number().default(0, { skipEncoding: true });
  z.number().default(0, { skipEncoding: false });
  z.number().default(0, { skipEncoding: { mode: "strict" } });
  z.number().default(0, { skipEncoding: { mode: "shallow" } });
  z.number().default(0, { skipEncoding: { mode: "deep" } });
  z.number().default(0, { skipEncoding: (v) => v === 0 });
  z.number().default(0, { skipEncoding: async (v) => v === 0 });
  zmini._default(zmini.number(), 0, { skipEncoding: true });

  // @ts-expect-error
  z.number().default(0, { skipEncoding: "deep" });
  // @ts-expect-error
  z.number().default(0, { skipEncoding: { mode: "unknown" } });
  // @ts-expect-error
  zmini._default(zmini.number(), 0, { skipEncoding: "invalid" });
});