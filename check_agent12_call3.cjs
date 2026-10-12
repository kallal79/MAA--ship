const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_12/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

let schemasTs = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", "utf8");
schemasTs = schemasTs.replace(
  "function compareMembers(a: unknown, b: unknown, deep: boolean, seen: [object, object][]): boolean {",
  "export function compareMembers(a: unknown, b: unknown, deep: boolean, seen: [object, object][]): boolean {"
);

let count = 0;
schemasTs = schemasTs.replace(/return false;/g, () => {
  count++;
  return `throw new Error("RETURN_FALSE_${count}");`;
});

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/core/schemas.ts", schemasTs);

const testContent2 = `
import { expect, test } from "vitest";
import { compareMembers } from "./packages/zod/src/v4/core/schemas.ts";

test("print encode result", () => {
  const u1 = new Uint8Array([1, 2, 3]);
  const u2 = new Uint8Array([1, 2, 3]);
  const result = compareMembers(u1, u2, true, []);
});
`;
fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testContent2);

try {
  cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", env: {...process.env, CI: "true"}});
} catch (e) {
  const stderr = e.stderr ? e.stderr.toString() : "";
  console.log("STDERR:\n", stderr.substring(0, 2000));
}
