const fs=require('fs'); 
let txt=fs.readFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts','utf8'); 
txt += `
test('chained defaulted schemas evaluate skipEncoding independently', () => { const inner = z.number().default(0, { skipEncoding: true }); const outer = inner.default(5, { skipEncoding: true }); expect(outer.encode(0)).toBe(0); expect(z.object({ a: outer }).encode({ a: 5 })).toEqual({}); expect(z.object({ a: outer }).encode({ a: 0 })).toEqual({ a: 0 }); });

test('encode skips default values with deep equality', () => { const schema = z.object({ date: z.date().default(new Date(1000), { skipEncoding: true }), arr: z.array(z.number()).default([1, 2], { skipEncoding: true }), obj: z.object({ x: z.number() }).default({ x: 1 }, { skipEncoding: true }), prim: z.nan().default(Number.NaN, { skipEncoding: true }), prim2: z.number().default(-0, { skipEncoding: true }), }); expect(schema.encode({ date: new Date(1000), arr: [1, 2], obj: { x: 1 }, prim: Number.NaN, prim2: -0, })).toEqual({}); });
`; 
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts',txt);
