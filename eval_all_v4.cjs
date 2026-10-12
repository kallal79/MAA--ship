const fs = require("fs");
const { execSync } = require("child_process");

const results = {};
const testPatch = "C:/Users/USER/OneDrive/Desktop/MAA/FINAL_TEST_PATCH_TO_UPLOAD.patch";

for (let i = 1; i <= 12; i++) {
  console.log("Testing Agent " + i);
  execSync("git reset --hard HEAD", {stdio: "ignore"});
  execSync("git clean -fd", {stdio: "ignore"});
  
  try {
    execSync(`git apply "C:/Users/USER/OneDrive/Desktop/MAA/agent-runs-THE-FINAL-ONE/Nova_Nova_${i}/solution-patch.patch"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (solution patch)";
    continue;
  }
  
  try {
    execSync(`git apply "${testPatch}"`, {stdio: "ignore"});
  } catch (e) {
    results[i] = "FAIL (test patch)";
    continue;
  }
  
  try {
    execSync(`pnpm vitest run packages/zod/src/v4/classic/tests/encode-defaults.8a4f9b.spec.ts --typecheck.enabled=false`, {stdio: "ignore", timeout: 15000});
    results[i] = "PASS";
  } catch (e) {
    results[i] = e.code === 'ETIMEDOUT' ? "FAIL (TIMEOUT)" : "FAIL";
  }
}
console.log(JSON.stringify(results, null, 2));
const passes = Object.values(results).filter(x => x === "PASS").length;
console.log("Passing: " + passes + "/12");
console.log("Target: " + (passes >= 3 && passes <= 4 ? "YES ✓" : "NO ✗"));
