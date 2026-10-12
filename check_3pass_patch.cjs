const fs = require("fs");
const cp = require("child_process");

const results = {};
for (const i of [1, 5, 7, 8, 12]) {
  cp.execSync("git reset --hard HEAD", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync("git clean -fd", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  cp.execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/TEST_PATCH_3_PASS.patch"`, {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "ignore"});
  
  try {
    const out = cp.execSync("pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false", {cwd: "C:/Users/USER/OneDrive/Desktop/MAA/zod", stdio: "pipe", timeout: 15000}).toString();
    if (out.includes("46 passed") || out.includes("Test Files  1 passed")) {
      results[i] = "PASS";
    } else {
      results[i] = "FAIL (output mismatch)";
    }
  } catch (e) {
    if (e.code === 'ETIMEDOUT') results[i] = "FAIL (TIMEOUT)";
    else {
      // Find the failing test
      const stdout = e.stdout ? e.stdout.toString() : e.toString();
      const failMatch = stdout.match(/FAIL\s+(.*?)\n/);
      results[i] = "FAIL (" + (failMatch ? failMatch[1] : "TEST FAILED") + ")";
    }
  }
}
console.log(JSON.stringify(results, null, 2));
