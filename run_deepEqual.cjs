const fs = require("fs");
const ts = require("typescript");

let code = fs.readFileSync("./packages/zod/src/v4/core/util.ts", "utf8");
code = ts.transpile(code);
fs.writeFileSync("./util_temp.js", code);

const util = require("./util_temp.js");
const s1 = new Set([{a: 1}]);
const s2 = new Set([{a: 1}]);
console.log('deepEqual:', util.deepEqual(s1, s2));
