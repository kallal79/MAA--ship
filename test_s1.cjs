const fs = require("fs");
const { execSync } = require("child_process");

// Apply Agent 1 (the best passing agent) and check S1 nested chaining
execSync("git reset --hard HEAD");
execSync("git clean -fd");
execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch"`, {stdio: "ignore"});

// S1: Test ZodDefault<ZodDefault<T>> with both skipEncoding: true
const s1Test = `
import { z } from './packages/zod/src/index.ts';

// S1: Chained defaults - each should independently evaluate its own rule
const inner = z.number().default(0, { skipEncoding: true });
const outer = inner.default(5, { skipEncoding: true });

// outer.encode(0): inner produces omit, outer sees "0" != "5", so outer does NOT omit
// The result when embedded should be {}: value=0 matches outer default? No, 0 != 5...
// Actually: inner.skipEncoding: value 0 == inner default 0, so inner says omit
// outer then encodes inner.default, outer sees the encoded {}, which then compares to its default {x:5}??

// Let me test what actually happens
console.log("outer.encode(0):", JSON.stringify(outer.encode(0)));
console.log("outer.encode(5):", JSON.stringify(outer.encode(5)));
console.log("z.object({v: outer}).encode({v: 0}):", JSON.stringify(z.object({v: outer}).encode({v: 0})));
console.log("z.object({v: outer}).encode({v: 5}):", JSON.stringify(z.object({v: outer}).encode({v: 5})));
`;

fs.writeFileSync("test_s1.ts", s1Test);
try {
  const out = execSync("pnpm exec tsx test_s1.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 2000));
}
