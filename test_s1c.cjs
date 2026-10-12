const fs = require("fs");
const { execSync } = require("child_process");

// S1 analysis: The issue says the outer default never evaluates its rule when payload.omit is true
// In the current implementation, lets trace through what happens with encode(0):
// z.number().default(0, {skipEncoding:true}).default(5, {skipEncoding:true})
// When encoding value 0:
//   outer._zod.parse is called with payload={value:0}
//   outer calls: inner._zod.run({value:0}, ctx) (backward direction)
//   inner is "ZodDefault of ZodNumber"  
//   inner.parse: ZodNumber encodes 0 -> 0
//   inner then calls handleDefaultEncodeResult(encoded={value:0}, def={skipEncoding:true, defaultValue:0})
//   inner: encodes its own default: 0 -> 0
//   inner: compares 0 == 0 -> true -> sets payload.omitted = true
//   inner returns payload {value:0, omitted: true}
//   outer receives "encoded" = {value:0, omitted: true}
//   outer calls handleDefaultEncodeResult({value:0, omitted:true}, def={skipEncoding:true, defaultValue:5})
//   outer: "if (payload.issues.length) return payload" - issues empty, continues
//   outer: encodes its own default: default=5, run inner(5) => ZodNumber(5) -> ZodDefault.backward -> encodes 5
//     inner(5): ZodNumber gives 5, inner.handleDefaultEncodeResult: 5 == 0? No. Returns {value:5}
//   outer: finish({value:5})
//   outer: "deepEqual(0, 5)"? No wait - it compares payload.value (which is 0) against encodedDefault.value (which is 5)
//   outer: 0 != 5, so NOT omitted -> returns {value:0, omitted:false}??
// 
// But we SAW that encode(0) returns undefined (OMIT)!
// That means the current implementation IS propagating inner's omit through!
// Let me verify by testing a case where the inner omits but outer SHOULD NOT omit:

const s1EdgeTest = `
import { z } from './packages/zod/src/index.ts';

// Inner omits (value==0) but outer should NOT omit (0 != outer default 5)
const inner = z.number().default(0, { skipEncoding: true });
const outer = inner.default(5, { skipEncoding: true });

// encode(0): inner says omit. But 0 != outer.default(5), so outer should NOT omit.
// S1 bug: outer propagates inner's omit unconditionally
console.log("outer.encode(0):", outer.encode(0));  // Bug: returns OMIT; should be 0
console.log("outer.encode(5):", outer.encode(5));  // Correct: OMIT (5 == outer default)
console.log("outer.encode(7):", outer.encode(7));  // Correct: 7

// If encode(0) returns OMIT, that is the S1 bug:
// The outer default (5) should NOT omit 0, but it does because inner's omit propagates through.
`;

fs.writeFileSync("test_s1c.ts", s1EdgeTest);
try {
  const out = execSync("pnpm exec tsx test_s1c.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 3000));
}
