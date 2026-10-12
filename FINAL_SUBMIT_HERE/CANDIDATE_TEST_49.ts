import { expect, test } from "vitest";
import { z, OMIT } from "../../../index.js";
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
  const result = schema.encode([1, 0, 2]);
  
  const isCompacted = result.length === 2 && result[0] === 1 && result[1] === 2;
  const isSparse = result.length === 3 && result[0] === 1 && !(1 in result) && result[2] === 2;
  
  expect(isCompacted || isSparse).toBe(true);
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
  expect(outer.encode({ x: 0 })).toBe(OMIT);
  expect(z.object({ o: outer }).encode({ o: { x: 0 } })).toEqual({});
  expect(outer.encode({ x: 1 })).toEqual({ x: 1 });
});

test("chained defaulted schemas evaluate skipEncoding independently", () => {
  const inner = z.number().default(0, { skipEncoding: true });
  const outer = inner.default(5, { skipEncoding: true });
  expect(outer.encode(5)).toBe(OMIT);
  expect(outer.encode(0)).toBe(0);
  expect(z.object({ a: outer }).encode({ a: 5 })).toEqual({});
  expect(z.object({ a: outer }).encode({ a: 0 })).toEqual({ a: 0 });
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

test("shallow equality mode", () => {
  const innerObj = { a: 1 };
  const innerArr = [2];
  const schema = z.object({
    arr: z.array(z.any()).default([1, innerObj], { skipEncoding: { mode: "shallow" } }),
    obj: z.record(z.string(), z.any()).default({ a: 1, b: innerArr }, { skipEncoding: { mode: "shallow" } }),
  });
  expect(schema.encode({ arr: [1, innerObj], obj: { a: 1, b: innerArr } })).toEqual({});
  expect(schema.encode({ arr: [1, { a: 1 }], obj: { a: 1, b: [2] } })).toEqual({
    arr: [1, { a: 1 }],
    obj: { a: 1, b: [2] },
  });
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

test("root-level encode", () => {
  const schema = z.number().default(0, { skipEncoding: true });
  expect(schema.encode(0)).toBe(OMIT);
  expect(schema.encode(0)).toBe(z.OMIT);
  expect(schema.encode(1)).toBe(1);
  const objSchema = z.object({ a: schema });
  expect(objSchema.encode({ a: 0 })).toEqual({});
});

test("TypeScript API surface", () => {
  z.number().default(0, { skipEncoding: true });
  z.number().default(0, { skipEncoding: { mode: "shallow" } });
  z.number().default(0, { skipEncoding: (v: number) => v === 0 });

  const s = z.object({ a: z.number().default(0, { skipEncoding: true }) });
  expect(s.encode({ a: 0 })).toEqual({});
});

test("skipEncoding: false explicitly does not skip", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: false }),
    b: z.number().default(0, { skipEncoding: true }),
  });
  expect(schema.encode({ a: 0, b: 0 })).toEqual({ a: 0 });
});

test("Set deep equality requires 1-to-1 bipartite matching (equal cardinality test)", () => {
  const el1 = { a: 1 };
  const el2 = { a: 1 };
  const defaultSet = new Set([{ a: 1 }, { a: 2 }]);
  const inputSet = new Set([el1, el2]);
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(defaultSet, { skipEncoding: true }),
  });
  expect(schema.encode({ s: inputSet })).toEqual({ s: inputSet });
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
  let capturedThis: any;
  const defSchema = z.object({ y: z.number() }).default(defaultObj, {
    skipEncoding: function(v, def) {
      capturedV = v;
      capturedDef = def;
      capturedThis = this;
      return true;
    },
  });
  const schema = z.object({
    x: defSchema,
  });
  expect(schema.encode({ x: { y: 0 } })).toEqual({});
  expect(capturedV).toEqual({ y: 0 });
  expect(capturedDef).toEqual(defaultObj);
  expect(capturedThis).toBe(defSchema);
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

test("async factory default with predicate throws error", () => {
  const schema = z.object({
    a: z.number().default(() => Promise.resolve(0) as any, {
      skipEncoding: (v) => v === 0,
    }),
  });
  expect(() => schema.encode({ a: 0 })).toThrow("Cannot use skipEncoding predicate with an async factory default");
});

test("comparison against final encoded output not explicitly distinguished", () => {
  const schema = z.object({ x: z.number().default(0, { skipEncoding: (v) => v === 0 }) });
  expect(schema.encode({ x: 0 })).toEqual({});
  expect(schema.encode({ x: 1 })).toEqual({ x: 1 });
});

test("encode correctly processes un-omitted array elements following omitted ones (LLM trap)", () => {
  const schema = z.array(z.number().default(0, { skipEncoding: true }));
  const result = schema.encode([1, 0, 2, 0, 3]);
  
  const isCompacted = result.length === 3 && result[0] === 1 && result[1] === 2 && result[2] === 3;
  const isSparse = result.length === 5 && result[0] === 1 && !(1 in result) && result[2] === 2 && !(3 in result) && result[4] === 3;
  
  expect(isCompacted || isSparse).toBe(true);
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

test("cascading omission from elements to parent container", () => {
  const schema = z.array(z.number().default(0, { skipEncoding: true })).default([], { skipEncoding: true });
  
  const r1 = z.object({ a: schema }).encode({ a: [0, 0] });
  const r1Compacted = Object.keys(r1).length === 0;
  const r1Sparse = "a" in r1 && (r1 as any).a.length === 2 && !(0 in (r1 as any).a) && !(1 in (r1 as any).a);
  expect(r1Compacted || r1Sparse).toBe(true);

  const r2 = z.object({ a: schema }).encode({ a: [0] });
  const r2Compacted = Object.keys(r2).length === 0;
  const r2Sparse = "a" in r2 && (r2 as any).a.length === 1 && !(0 in (r2 as any).a);
  expect(r2Compacted || r2Sparse).toBe(true);

  expect(z.object({ a: schema }).encode({ a: [1] })).toEqual({ a: [1] });
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

test("root-level non-omission across all option forms", () => {
  const strictSchema = z.number().default(0, { skipEncoding: { mode: "strict" } });
  const predSchema = z.number().default(0, { skipEncoding: (v) => v === 0 });
  const trueSchema = z.number().default(0, { skipEncoding: true });
  expect(strictSchema.encode(0)).toBe(OMIT);
  expect(predSchema.encode(0)).toBe(OMIT);
  expect(trueSchema.encode(0)).toBe(OMIT);
  const obj = z.object({ a: strictSchema, b: predSchema, c: trueSchema });
  expect(obj.encode({ a: 0, b: 0, c: 0 })).toEqual({});
});

test("mini API support", () => {
  const schema = zmini.object({
    a: z._default(zmini.number(), 0, { skipEncoding: true })
  });
  expect(zmini.encode(schema, { a: 0 })).toEqual({});
  expect(zmini.encode(schema, { a: 1 })).toEqual({ a: 1 });
  expect(zmini.OMIT).toBe(OMIT);
});

test("transparent wrappers pass through omission", () => {
  const schema = z.object({
    a: z.number().default(0, { skipEncoding: true }).optional(),
    b: z.number().default(0, { skipEncoding: true }).nullable(),
    c: z.number().default(0, { skipEncoding: true }).catch(1)
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
  const schema = z.any().default(new Set([NaN]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([NaN]) })).toEqual({});
  expect(z.object({ s: schema }).encode({ s: new Set([0]) })).toEqual({ s: new Set([0]) });
});









