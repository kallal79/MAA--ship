const fs = require("fs");
const { execSync } = require("child_process");

const results = {};

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD && git clean -fd", {stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (solution patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/zod/FINAL_TEST_PATCH_TO_UPLOAD.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (test patch failed to apply)";
    continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      results[i] = "FAIL (TIMEOUT / INFINITE LOOP)";
    } else {
      results[i] = "FAIL (TEST SUITE FAILED)";
    }
  }
}
console.log("\nFINAL RESULTS:");
console.log(JSON.stringify(results, null, 2));
