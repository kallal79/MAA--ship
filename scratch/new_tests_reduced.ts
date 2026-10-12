
// --- New tests to catch edge cases and reduce pass rate ---

test("skipEncoding: false explicitly does not omit", () => {
  const schema = z.object({ a: z.number().default(0, { skipEncoding: false }) });
  expect(schema.encode({ a: 0 })).toEqual({ a: 0 });
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
