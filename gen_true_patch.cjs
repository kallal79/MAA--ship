const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_1/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "inherit"});

// Fix S1 bug in core/schemas.ts
let schemasTs = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", "utf8");
schemasTs = schemasTs.replace(
  "function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, ctx: ParseContextInternal) {\n  if (payload.issues.length) return payload;\n\n  const finish = (encodedDefault: ParsePayload) => {",
  "function handleDefaultEncodeResult(payload: ParsePayload, def: $ZodDefaultDef, ctx: ParseContextInternal) {\n  if (payload.issues.length) return payload;\n  // Reset the omitted flag so this layer evaluates its own skipEncoding rule independently\n  payload.omitted = false;\n\n  const finish = (encodedDefault: ParsePayload) => {"
);
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", schemasTs);

// Fix util.ts deepEqual and shallowEqual
let utilTs = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/util.ts", "utf8");
utilTs = utilTs.replace(
  "export function shallowEqual(a: any, b: any): boolean {\n  if (Object.is(a, b)) return true;\n  if (!a || !b || typeof a !== \"object\" || typeof b !== \"object\") return false;",
  "export function shallowEqual(a: any, b: any): boolean {\n  if (Object.is(a, b)) return true;\n  if (!a || !b || typeof a !== \"object\" || typeof b !== \"object\") return false;\n  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();\n  if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;"
);
utilTs = utilTs.replace(
  "export function deepEqual(a: any, b: any, seen = new Map<any, Set<any>>()): boolean {\n  if (Object.is(a, b)) return true;\n  if (!a || !b || typeof a !== \"object\" || typeof b !== \"object\") return false;",
  "export function deepEqual(a: any, b: any, seen = new Map<any, Set<any>>()): boolean {\n  if (Object.is(a, b)) return true;\n  if (!a || !b || typeof a !== \"object\" || typeof b !== \"object\") return false;\n  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();\n  if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;"
);
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/util.ts", utilTs);

// Export full patch
cp.execSync("git add packages/zod/src/v4", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
const patch = cp.execSync("git diff --staged packages/zod/src/v4", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod"}).toString();
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/FINAL_SOLUTION_TO_UPLOAD.patch", patch);
console.log("Generated true final solution patch");
