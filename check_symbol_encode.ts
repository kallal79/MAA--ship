const { z } = require("./zod/packages/zod/src/index.ts");
const sym = Symbol("test");
const a = { [sym]: 1 };
const b = { [sym]: 2 };

const schema = z.object({
   s: z.any().default(a, { skipEncoding: true })
});
console.log(schema.encode({ s: b }));
