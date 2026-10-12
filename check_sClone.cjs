const { util } = require("./packages/zod/src/v4/core/util.js");
const s = new Set([1, 2]);
const sClone = util.shallowClone(s);
console.log(s === sClone, sClone instanceof Set);
