const { z } = require("./packages/zod/src/index.ts");
const a = {};
a.next = a;
const b = { next: {} };
b.next.next = b;

const schema = z.object({
   s: z.any().default(a, { skipEncoding: true })
});
console.log("encode result:");
console.dir(schema.encode({ s: b }), { depth: null });
