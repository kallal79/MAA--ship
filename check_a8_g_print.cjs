const { z } = require("./zod/packages/zod/src/index.ts");

const O1 = { val: 1 };
const O2 = { val: 2 };
const O1_COPY = { val: 1 };
const O2_COPY = { val: 2 };

const a = [ new Set([ O1, O2_COPY ]), O1 ];
const b = [ new Set([ O2, O1_COPY ]), O2 ];

const schema = z.object({
   s: z.any().default(a, { skipEncoding: true })
});
console.dir(schema.encode({ s: b }), { depth: null });
