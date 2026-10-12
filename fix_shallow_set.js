const fs = require('fs');
let file = fs.readFileSync('c:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', 'utf8');

file = file.replace(
  'test("strict equality mode", () => {',
  'test("shallow equality mode - Set", () => {\n  const o1 = { a: 1 };\n  const s1 = new Set([o1]);\n  const schema = z.object({\n    s: z.set(z.any()).default(s1, { skipEncoding: { mode: "shallow" } }),\n  });\n  expect(schema.encode({ s: new Set([o1]) })).toEqual({});\n  expect(schema.encode({ s: new Set([{ a: 1 }]) })).toEqual({ s: new Set([{ a: 1 }]) });\n});\n\ntest("strict equality mode", () => {'
);

fs.writeFileSync('c:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts', file);
console.log("Done");
