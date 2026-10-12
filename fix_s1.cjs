const fs = require("fs");
const { execSync } = require("child_process");

// Found the issue! 
// The outer default calls: def.innerType._zod.run(payload, ctx)
// For ZodDefault<ZodDefault<T>>, the inner is the inner ZodDefault 
// When inner ZodDefault runs, it sets payload.omitted = true ON THE SAME PAYLOAD OBJECT!
// Then outer.handleDefaultEncodeResult receives the SAME payload object (which already has omitted=true)
// outer then does: "if (deepEqual(payload.value, encodedDefault.value)) payload.omitted = true"
// But since it was already true from inner, it stays true EVEN IF outer would not have set it!

// So the S1 bug is real:
// 1. Outer calls inner._zod.run(payload, ctx)
// 2. Inner mutates payload.omitted = true (because 0 == 0)
// 3. Outer receives the mutated payload
// 4. Outer's handleDefaultEncodeResult: deepEqual(0, 5) = false → doesn't SET payload.omitted
// 5. But payload.omitted is STILL true from inner!
// 
// FIX: Outer should RESET payload.omitted before evaluating its own rule
// i.e., in handleDefaultEncodeResult, BEFORE doing the comparison, reset payload.omitted = false
// Then set it to true only if the outer's own rule matches.

// VERIFYING: Let me patch this fix and test
const content = fs.readFileSync("packages/zod/src/v4/core/schemas.ts", "utf8");
const idx = content.indexOf("function handleDefaultEncodeResult(payload");
const patched = content.substring(0, idx) +
  content.substring(idx).replace(
    'function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, ctx: ParseContextInternal) {\n  if (payload.issues.length) return payload;',
    'function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, ctx: ParseContextInternal) {\n  if (payload.issues.length) return payload;\n  // Reset the omitted flag so this layer evaluates its own skipEncoding rule independently\n  payload.omitted = false;'
  );
fs.writeFileSync("packages/zod/src/v4/core/schemas.ts", patched);
console.log("Patched schemas.ts");

// Now test again
const s1Test = `
import { z } from './packages/zod/src/index.ts';
const inner = z.number().default(0, { skipEncoding: true });
const outer = inner.default(5, { skipEncoding: true });
console.log("outer.encode(0):", outer.encode(0));  // should be 0 (not OMIT)
console.log("outer.encode(5):", outer.encode(5));  // should be OMIT  
console.log("outer.encode(7):", outer.encode(7));  // should be 7
console.log("z.object({v: outer}).encode({v: 0}):", JSON.stringify(z.object({v: outer}).encode({v: 0}))); // {v: 0}
console.log("z.object({v: outer}).encode({v: 5}):", JSON.stringify(z.object({v: outer}).encode({v: 5}))); // {}
console.log("z.object({v: outer}).encode({v: 7}):", JSON.stringify(z.object({v: outer}).encode({v: 7}))); // {v: 7}

// Also test that when inner omits AND outer would also omit, it still works
const inner2 = z.number().default(0, { skipEncoding: true });
const outer2 = inner2.default(0, { skipEncoding: true }); // same default
console.log("outer2.encode(0):", outer2.encode(0)); // should be OMIT
console.log("outer2.encode(1):", outer2.encode(1)); // should be 1
`;

fs.writeFileSync("test_s1_fixed.ts", s1Test);
try {
  const out = execSync("pnpm exec tsx test_s1_fixed.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 3000));
}
