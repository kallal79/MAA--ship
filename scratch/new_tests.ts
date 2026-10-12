

// --- New tests to catch edge cases and reduce pass rate ---

test("skipEncoding: false explicitly does not omit", () => {
  const schema = z.object({ a: z.number().default(0, { skipEncoding: false }) });
  expect(schema.encode({ a: 0 })).toEqual({ a: 0 });
});

test("root-level encode is never omitted", () => {
  const schema = z.number().default(0, { skipEncoding: true });
  expect(schema.encode(0)).toBe(0);
});

test("container-level default omission", () => {
  const schema = z.object({
    arr: z.array(z.string()).default(["a"], { skipEncoding: true }),
    obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true })
  });
  expect(schema.encode({ arr: ["a"], obj: { x: 1 } })).toEqual({});
  expect(schema.encode({ arr: ["b"], obj: { x: 2 } })).toEqual({ arr: ["b"], obj: { x: 2 } });
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

test("non-factory sync predicate is passed raw default", () => {
  const schema = z.object({
    a: z.number().default(0, {
      skipEncoding: (val, def) => val === 0 && def === 0
    })
  });
  expect(schema.encode({ a: 0 })).toEqual({});
});

test("encodeAsync factory predicate is passed undefined", async () => {
  const schema = z.object({
    a: z.number().default(() => 0, {
      skipEncoding: (val, def) => val === 0 && def === undefined
    })
  });
  expect(await schema.encodeAsync({ a: 0 })).toEqual({});
});
