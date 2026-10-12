const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("print encode result", () => {
  const { $ZodDefault } = require("./packages/zod/src/v4/core/schemas.ts");
  // ZodDefault defines compareMembers internally, we can't easily extract it. Let's just create a ZodDefault.
  const u1 = new Uint8Array([1, 2, 3]);
  const u2 = new Uint8Array([1, 2, 3]);
  const schema = z.any().default(u1, { skipEncoding: true });
  const result = schema._zod.run({ value: u2, issues: [] }, { direction: "backward", async: false, skipChecks: false, _schema: schema });
  console.log("OMITTED:", result.omitted);
});
`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testContent);

// Wait, I can just modify schemas.ts to EXPORT compareMembers so I can call it directly!
const schemasTs = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", "utf8");
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", schemasTs.replace(
  "function compareMembers(a: unknown, b: unknown, deep: boolean, seen: [object, object][]): boolean {",
  "export function compareMembers(a: unknown, b: unknown, deep: boolean, seen: [object, object][]): boolean {"
));

const testContent2 = `
import { expect, test } from "vitest";
import { compareMembers } from "./packages/zod/src/v4/core/schemas.ts";

test("print encode result", () => {
  const u1 = new Uint8Array([1, 2, 3]);
  const u2 = new Uint8Array([1, 2, 3]);
  const result = compareMembers(u1, u2, true, []);
  throw new Error("COMPARE_MEMBERS_RESULT: " + result);
});
`;
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testContent2);

try {
  cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", env: {...process.env, CI: "true"}});
} catch (e) {
  const stderr = e.stderr ? e.stderr.toString() : "";
  console.log("STDERR:\n", stderr.substring(0, 2000));
}
