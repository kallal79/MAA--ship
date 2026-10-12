const fs = require("fs");
const cp = require("child_process");

cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_1/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_3_PASS.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});

try {
  const out = cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false 2>&1", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", timeout: 15000}).toString();
  console.log(out.substring(0, 1000));
} catch (e) {
  const stdout = e.stdout ? e.stdout.toString() : e.toString();
  console.log(stdout.split("\n").filter(l => l.includes("FAIL") || l.includes("AssertionError")).slice(0, 20).join("\n"));
}
