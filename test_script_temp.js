const { z } = require('./packages/zod/lib/index.js');

try {
  const inner = z.string().default("inner", { skipEncoding: true });
  const outer = inner.default("outer", { skipEncoding: false });
  const schema = z.object({ val: outer });
  const res = schema.encode({ val: "inner" });
  console.log("T1 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const arr1 = []; arr1[2] = 1;
  const arr2 = []; arr2[2] = 1;
  const schema = z.object({ a: z.any().default(arr1, { skipEncoding: true }) });
  const res = schema.encode({ a: arr2 });
  console.log("T2 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const schema = z.object({ s: z.any().default(new Set([Number.NaN]), { skipEncoding: true }) });
  const res = schema.encode({ s: new Set([Number.NaN]) });
  console.log("T3 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const schema = z.object({
    m: z.map(z.object({ k: z.number() }), z.string()).default(new Map([[{ k: 1 }, "v"]]), { skipEncoding: true }),
  });
  const res = schema.encode({ m: new Map([[{ k: 1 }, "v"]]) });
  console.log("T4 OUTPUT:", JSON.stringify(res));
} catch(e) {}

try {
  const schema = z.object({
    s: z.set(z.object({ a: z.number() })).default(new Set([{ a: 1 }, { a: 2 }]), { skipEncoding: true }),
  });
  const res = schema.encode({ s: new Set([{ a: 1 }, { a: 1 }]) });
  console.log("T5 OUTPUT:", JSON.stringify({ s: Array.from(res.s || []) }));
} catch(e) {}
