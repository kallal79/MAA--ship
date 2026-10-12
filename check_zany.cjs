const fs = require("fs");
const cp = require("child_process");

const testContent = `
import { expect, test } from "vitest";
import { z } from "./packages/zod/src/index.ts";

test("print encode result", () => {
  const result = z.any()._zod.run({ value: 1, issues: [] }, { direction: "backward", async: false, skipChecks: false });
  console.log("RESULT_KEYS:", Object.keys(result));
});
`;

fs.writeFileSync("C:/Users/USER/OneDrive/Desktop/MAA/zod/packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts", testContent);

try {
  const out = cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", env: {...process.env, CI: "true"}}).toString();
  console.log("STDOUT:\n", out);
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : "";
  console.log("STDOUT(ERR):\n", stdout);
}
