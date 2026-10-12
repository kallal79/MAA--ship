const { execSync } = require("child_process");
const fs = require("fs");
function stripAnsi(str) { return str.replace(/\x1b\[[0-9;]*m/g, ""); }
try {
  const res = execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", encoding: "utf8"});
  console.log("PASS");
} catch(e) {
  console.log(stripAnsi(e.stdout || e.stderr));
}
