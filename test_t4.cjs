const fs = require("fs");
const { execSync } = require("child_process");

// Now check the shallow map test that T4 says is missing
const t4Test = `
import { z } from './packages/zod/src/index.ts';

// T4: shallow Map equality - same key & value instances match; structurally same but distinct do NOT
const keyObj = { k: 1 };
const valObj = { v: 2 };

// Same instances
const mapA = new Map([[keyObj, valObj]]);
// Different instances with same structure
const mapB = new Map([[{ k: 1 }, { v: 2 }]]);

const schema = z.any().default(mapA, { skipEncoding: { mode: "shallow" } });

// Same instance should match (OMIT)
console.log("shallow map - same instances:", JSON.stringify(z.object({ m: schema }).encode({ m: mapA }))); // {}

// Different instances (even if structurally same) should NOT match
console.log("shallow map - diff instances:", JSON.stringify(z.object({ m: schema }).encode({ m: mapB }))); // { m: mapB }
`;

fs.writeFileSync("test_t4.ts", t4Test);
try {
  const out = execSync("pnpm exec tsx test_t4.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 3000));
}
