const { util } = require("./zod/packages/zod/src/v4/core/util.ts");
const sym = Symbol("test");
const a = { [sym]: 1 };
const b = { [sym]: 2 };

console.log("deepEqual:", util.deepEqual(b, a));
