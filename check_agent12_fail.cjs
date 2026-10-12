const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const schemasTs = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", schemasTs.replace(
  "if (!Object.prototype.hasOwnProperty.call(b, key)) return false;",
  "if (!Object.prototype.hasOwnProperty.call(b, key)) { console.log('FAIL_HASOWN:', String(key)); return false; }"
).replace(
  "if (!equal((a as any)[key], (b as any)[key])) return false;",
  "if (!equal((a as any)[key], (b as any)[key])) { console.log('FAIL_EQUAL:', String(key), (a as any)[key], (b as any)[key]); return false; }"
).replace(
  "if (aKeys.length !== bKeys.length) return false;",
  "if (aKeys.length !== bKeys.length) { console.log('FAIL_LENGTH:', aKeys.length, bKeys.length); return false; }"
));

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("print encode result", () => {
  const u1 = new Uint8Array([1, 2, 3]);
  const u2 = new Uint8Array([1, 2, 3]);
  const schema = z.any().default(u1, { skipEncoding: true });
  z.object({ u: schema }).encode({ u: u2 });
});
`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testContent);

try {
  cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", env: {...process.env, CI: "true"}});
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : "";
  console.log("STDOUT:\n", stdout);
}
