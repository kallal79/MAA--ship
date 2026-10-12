const fs = require('fs');
let p = fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');
p += `

test("deep equality correctly matches NaN in Sets (LLM trap)", () => {
  const schema = z.any().default(new Set([Number.NaN]), { skipEncoding: true });
  expect(z.object({ s: schema }).encode({ s: new Set([Number.NaN]) })).toEqual({});
  expect(z.object({ s: schema }).encode({ s: new Set([0]) })).toEqual({ s: new Set([0]) });
});

test("shallow mode correctly matches Symbol keys", () => {
  const sym = Symbol("test");
  const schema = z.object({ s: z.any().default({ [sym]: 1 }, { skipEncoding: { mode: "shallow" } }) });
  expect(schema.encode({ s: { [sym]: 1 } })).toEqual({});
  expect(schema.encode({ s: { [sym]: 2 } })).toEqual({ s: { [sym]: 2 } });
});

test("deep equality correctly distinguishes -0 and +0", () => {
  const schema = z.object({ n: z.number().default(0, { skipEncoding: true }) });
  expect(schema.encode({ n: 0 })).toEqual({});
  expect(schema.encode({ n: -0 })).toEqual({ n: -0 });
});
`;
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', p);
