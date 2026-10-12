const fs = require("fs");
const { execSync } = require("child_process");

const s1Test = `
import { z } from './packages/zod/src/index.ts';

// S1: When inner omits and outer has different rule, outer should evaluate independently
const inner = z.number().default(0, { skipEncoding: true });
const outer = inner.default(5, { skipEncoding: true });

// outer default = 5, inner default = 0
// encode(5): inner result is 5 (not inner default 0), outer sees 5 == outer default 5 => omit
// encode(0): inner result is 0 == inner default 0 => inner omits. 
//             outer should see the "inner encoded representation of 0" (which is {omitted}) 
//             and compare THAT against outer's encoded default representation
// encode(7): inner result is 7 != 0 => 7, outer sees 7 != 5 => NOT omitted
console.log("outer.encode(5):", outer.encode(5));  // should be OMIT (5 == outer default)
console.log("outer.encode(0):", outer.encode(0));  // should be... 0 or OMIT?
console.log("outer.encode(7):", outer.encode(7));  // should be 7 (not omitted)
console.log("z.object({v: outer}).encode({v: 5}):", JSON.stringify(z.object({v: outer}).encode({v: 5}))); // {}
console.log("z.object({v: outer}).encode({v: 0}):", JSON.stringify(z.object({v: outer}).encode({v: 0}))); // {v: 0}?
console.log("z.object({v: outer}).encode({v: 7}):", JSON.stringify(z.object({v: outer}).encode({v: 7}))); // {v: 7}

// S1 review issue says:
// z.number().default(0, {skipEncoding:true}).default(5, {skipEncoding:true})
// outer never evaluates its own rule when inner already produced omit
// So encode(0) => outer propagates inner's omit => encoded as {} (not {v:0})
// That is a bug per S1 - outer should evaluate independently 
`;

fs.writeFileSync("test_s1b.ts", s1Test);
try {
  const out = execSync("pnpm exec tsx test_s1b.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 3000));
}
