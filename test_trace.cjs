const fs = require("fs");
const { execSync } = require("child_process");

// Now let me trace the outer default execution when inner is already omitted
// The key insight: the outer default's handleDefaultEncodeResult is called with the payload from inner
// That inner payload has omitted=true AND value=0

// But in handleDefaultEncodeResult:
//   1. Guard: if (payload.issues.length) return payload  → issues empty, continue
//   2. finish() is called with the encoded default
//   3. deepEqual(payload.value=0, encodedDefault.value=5) → false → omitted stays false

// So WHY does outer.encode(0) return undefined?
// Let's check if the outer's $ZodDefault._zod.parse is actually being called differently...

const traceTest = `
import { z } from './packages/zod/src/index.ts';
import { ParsePayload } from './packages/zod/src/v4/core/schemas.ts';

const inner = z.number().default(0, { skipEncoding: true });

// Monkey-patch to trace
const originalParse = (inner as any)._zod.parse;
(inner as any)._zod.parse = (payload: any, ctx: any) => {
  const result = originalParse(payload, ctx);
  if (result && typeof result === 'object' && 'omitted' in result) {
    console.log("inner parse returned: value=", result.value, "omitted=", result.omitted);
  }
  return result;
};

const outer = inner.default(5, { skipEncoding: true });
const originalOuterParse = (outer as any)._zod.parse;
(outer as any)._zod.parse = (payload: any, ctx: any) => {
  const result = originalOuterParse(payload, ctx);
  if (result && typeof result === 'object') {
    console.log("outer parse returned: value=", result.value, "omitted=", result.omitted);
  }
  return result;
};

const ctx = { direction: 'backward', async: false };
const payload = { value: 0, issues: [] };
console.log("Calling outer.encode(0)...");
const result = (outer as any)._zod.run(payload, ctx);
console.log("Final:", JSON.stringify(result));
`;

fs.writeFileSync("test_trace.ts", traceTest);
try {
  const out = execSync("pnpm exec tsx test_trace.ts", {timeout: 15000}).toString();
  console.log(out);
} catch(e) {
  console.log("ERROR:", e.toString().substring(0, 3000));
}
