const { util } = require("./zod/packages/zod/src/v4/core/util.ts");

const O1 = { val: 1 };
const O2 = { val: 2 };
const O1_COPY = { val: 1 };
const O2_COPY = { val: 2 };

const a = [ new Set([ O1, O2_COPY ]), O1 ];
const b = [ new Set([ O2, O1_COPY ]), O2 ];

console.log("deepEqual:", util.deepEqual(a, b));
