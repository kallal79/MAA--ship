const { z } = require("./zod/packages/zod/src/index.ts");
const schema = z.object({
  s: z.number().default(0, { skipEncoding: true })
});
console.dir(schema.encode({ s: 0 }), { depth: null });
